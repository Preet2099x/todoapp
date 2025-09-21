import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { signupSchema } from "@/lib/validation/auth";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, username, password } = parsed.data;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email or username already in use" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, username, password: hashed },
      select: { id: true, email: true, username: true },
    });

    return NextResponse.json({ user });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
