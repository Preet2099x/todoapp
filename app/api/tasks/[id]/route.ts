import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getTokenFromCookie, verifyToken } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const cookie = req.headers.get("cookie");
  const token = getTokenFromCookie(cookie);
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description, dueDate, completed } = await req.json();
  const id = params.id;

  const updatedCount = await prisma.task.updateMany({
    where: { id, userId: payload.userId },
    data: { title, description, dueDate: dueDate ? new Date(dueDate) : null, completed },
  });

  if (!updatedCount.count) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.task.findUnique({ where: { id } });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const cookie = req.headers.get("cookie");
  const token = getTokenFromCookie(cookie);
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = params.id;
  const deleted = await prisma.task.deleteMany({ where: { id, userId: payload.userId } });
  if (!deleted.count) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
