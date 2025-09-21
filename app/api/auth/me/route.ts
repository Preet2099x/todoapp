import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken, getTokenFromCookie } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie');
    const token = getTokenFromCookie(cookieHeader);
    
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        username: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}