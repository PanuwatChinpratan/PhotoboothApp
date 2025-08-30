import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { auth } from "@/auth";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number(params.id);
  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo || photo.userId !== Number(session.user.id))
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.photo.delete({ where: { id } });
  return NextResponse.json({}, { status: 204 });
}
