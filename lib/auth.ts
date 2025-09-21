// lib/auth.ts
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const COOKIE_NAME = "token";
const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) throw new Error("Missing JWT_SECRET env var");

export function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string | null): { id: string; email: string } | null {
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string };
  } catch {
    return null;
  }
}

export function getTokenFromCookie(cookieHeader: string | null) {
  if (!cookieHeader) return null;
  const m = cookieHeader.match(new RegExp(`(^|; )${COOKIE_NAME}=([^;]+)`));
  return m ? m[2] : null;
}

export function setTokenCookie(res: NextResponse, token: string) {
  res.headers.set(
    "Set-Cookie",
    `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax`
  );
}

export function clearTokenCookie(res: NextResponse) {
  res.headers.set("Set-Cookie", `${COOKIE_NAME}=deleted; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`);
}
