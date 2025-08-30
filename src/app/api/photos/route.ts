import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { auth } from "@/auth";
import { photoCreateSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rateLimit";
import { createHash } from "node:crypto";

// GET: คืนรูปเป็น URL ของ Cloudinary + width/height
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const cursor = url.searchParams.get("cursor") ?? undefined;
    const take = 12;

    const photos = await prisma.photo.findMany({
      // แนะนำใส่ secondary orderBy ด้วย id ให้ pagination เสถียร
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: take + 1,
      where: { url: { not: null } },            // ✅ ใช้ not:null
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: {
        id: true,
        caption: true,
        url: true,
        width: true,
        height: true,
        createdAt: true,
      },
    });

    const hasMore = photos.length > take;
    const pageItems = hasMore ? photos.slice(0, take) : photos;
    const nextCursor = hasMore ? pageItems[pageItems.length - 1]?.id : undefined;

    return NextResponse.json({ photos: pageItems, nextCursor }, { status: 200 });
  } catch (err) {
    console.error("[GET /api/photos] error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: ผูกผู้ใช้ด้วย email (ไม่ต้องอาศัย session.user.id)
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = req.headers.get("x-forwarded-for") || "unknown";
  if (!rateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  const json = await req.json();
  const parsed = photoCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { image, caption, meta } = parsed.data;
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  if (!cloudinaryUrl) {
    return NextResponse.json(
      { error: "Missing Cloudinary configuration" },
      { status: 500 }
    );
  }
  const creds = new URL(cloudinaryUrl);
  const cloudName = creds.hostname;
  const apiKey = creds.username;
  const apiSecret = creds.password;
  const timestamp = Math.round(Date.now() / 1000);
  const signature = createHash("sha1")
    .update(`timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  const form = new FormData();
  form.append("file", `data:image/png;base64,${image}`);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("signature", signature);

  const upload = (await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    {
      method: "POST",
      body: form,
    }
  ).then((r) => r.json())) as any;

  const created = (await prisma.photo.create({
    data: {
      caption: caption ?? null,
      url: upload.secure_url ?? upload.url,
      width: meta?.width ?? 0,
      height: meta?.height ?? 0,
      meta: meta ?? undefined,
      // ✅ connect ด้วย email (unique)
      user: { connect: { email: session.user.email } },
    } as any,
  })) as any;

  return NextResponse.json(
    {
      id: created.id,
      caption: created.caption,
      url: created.url,
      width: created.width,
      height: created.height,
      createdAt: created.createdAt,
    },
    { status: 201 }
  );
}
