import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/db";
import { signToken, setTokenCookie } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = body ?? {};
  if (!email || !password) return NextResponse.json({ error: "Missing email/password" }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "Email exists" }, { status: 409 });

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, password: hashed } });

  const token = signToken({ userId: user.id, email: user.email });
  const res = NextResponse.json({ user: { id: user.id, email: user.email } });
  setTokenCookie(res, token);
  return res;
}
