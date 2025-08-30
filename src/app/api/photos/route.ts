import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { auth } from "@/auth";
import { photoCreateSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rateLimit";

// GET: คืนรูปเป็น base64 string + width/height
export async function GET(req: Request) {
  const url = new URL(req.url);
  const cursor = url.searchParams.get("cursor");
  const take = 12;

  const photos = await prisma.photo.findMany({
    orderBy: { createdAt: "desc" },
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = photos.length > take;
  if (hasMore) photos.pop();
  const nextCursor = hasMore ? photos[photos.length - 1]?.id : undefined;

  // ✅ แปลง Bytes/Buffer → base64 ก่อนส่ง
  const safe = photos.map((p) => ({
    id: p.id,
    caption: p.caption,
    data: Buffer.from(p.data as unknown as Uint8Array).toString("base64"),
    width: p.width,
    height: p.height,
    createdAt: p.createdAt,
  }));

  return NextResponse.json({ photos: safe, nextCursor });
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
  const buffer = Buffer.from(image, "base64");

  const created = await prisma.photo.create({
    data: {
      caption: caption ?? null,
      data: buffer,
      width: meta?.width ?? 0,
      height: meta?.height ?? 0,
      meta: meta ?? undefined,
      // ✅ connect ด้วย email (unique)
      user: { connect: { email: session.user.email } },
    },
  });

  return NextResponse.json(
    {
      id: created.id,
      caption: created.caption,
      data: Buffer.from(created.data as unknown as Uint8Array).toString("base64"),
      width: created.width,
      height: created.height,
      createdAt: created.createdAt,
    },
    { status: 201 }
  );
}
