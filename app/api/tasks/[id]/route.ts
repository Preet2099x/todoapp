import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getTokenFromCookie, verifyToken } from "@/lib/auth";
import { updateTaskSchema } from "@/lib/validation/task";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookie = req.headers.get("cookie");
  const token = getTokenFromCookie(cookie);
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = updateTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { title, description, dueDate, completed } = parsed.data;
    const { id } = await params;

    // Build update data excluding undefined values
    const updateData: {
      title?: string;
      description?: string;
      dueDate?: Date | null;
      completed?: boolean;
    } = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (completed !== undefined) updateData.completed = completed;

    const updatedCount = await prisma.task.updateMany({
      where: { id, userId: payload.id },
      data: updateData,
    });

    if (!updatedCount.count) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await prisma.task.findUnique({ where: { id } });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("Update task error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookie = req.headers.get("cookie");
  const token = getTokenFromCookie(cookie);
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const deleted = await prisma.task.deleteMany({ where: { id, userId: payload.id } });
  if (!deleted.count) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
