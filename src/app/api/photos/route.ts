import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { auth } from "@/auth";
import { photoCreateSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rateLimit";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const cursor = url.searchParams.get("cursor");
  const take = 12;
  const photos = await prisma.photo.findMany({
    where: {},
    orderBy: { id: "desc" },
    take: take + 1,
    skip: cursor ? 1 : 0,
    ...(cursor ? { cursor: { id: Number(cursor) } } : {}),
  });
  const nextCursor = photos.length > take ? photos.pop()?.id : undefined;
  return NextResponse.json({ photos, nextCursor });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  if (!rateLimit(ip))
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": "60" } });
  const json = await req.json();
  const parsed = photoCreateSchema.safeParse(json);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  const { image, caption, meta } = parsed.data;
  const buffer = Buffer.from(image, "base64");
  const created = await prisma.photo.create({
    data: {
      userId: Number(session.user.id),
      caption,
      data: buffer,
      width: meta?.width ?? 0,
      height: meta?.height ?? 0,
      meta,
    },
  });
  return NextResponse.json(created, { status: 201 });
}
