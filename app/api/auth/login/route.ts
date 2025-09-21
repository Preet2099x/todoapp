import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { loginSchema } from "@/lib/validation/auth";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    const res = NextResponse.json({
      user: { id: user.id, email: user.email, username: user.username },
    });
    res.cookies.set("token", token, { httpOnly: true, sameSite: "lax", secure: false });
    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
