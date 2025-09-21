import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getTokenFromCookie, verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie");
  const token = getTokenFromCookie(cookie);
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tasks = await prisma.task.findMany({ where: { userId: payload.id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  const cookie = req.headers.get("cookie");
  const token = getTokenFromCookie(cookie);
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description, dueDate } = await req.json();
  if (!title) return NextResponse.json({ error: "Missing title" }, { status: 400 });

  const task = await prisma.task.create({
    data: { title, description, dueDate: dueDate ? new Date(dueDate) : null, userId: payload.id },
  });
  return NextResponse.json(task);
}
