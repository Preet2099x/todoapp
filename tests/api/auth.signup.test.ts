// tests/api/auth.signup.test.ts
/**
 * We're going to import the POST handler from app/api/auth/signup/route.ts
 * and mock prisma + bcrypt. Adjust the import path if your file differs.
 */

import { POST } from "@/app/api/auth/signup/route";

jest.mock("@/lib/db", () => {
  return {
    prisma: {
      user: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    },
  };
});

jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashed-password"),
}));

import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";

describe('POST /api/auth/signup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns 400 when required fields missing', async () => {
    const req = new Request("http://localhost/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email: "a@b.com" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req as any);
    // route returns NextResponse; check status
    // NextResponse.json returns a Response-like object; convert to JSON
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toBeDefined();
  });

  test('creates user when input valid and no existing user', async () => {
    // prisma.user.findFirst returns null -> no existing user
    (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue({
      id: "uuid",
      email: "you@example.com",
      username: "anmol",
    });

    const payload = {
      email: "you@example.com",
      username: "anmol",
      password: "abcdef",
      confirmPassword: "abcdef",
    };
    const req = new Request("http://localhost/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const res: any = await POST(req as any);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.user).toBeDefined();
    expect(prisma.user.create).toHaveBeenCalled();
    expect(bcrypt.hash).toHaveBeenCalledWith("abcdef", 10);
  });

  test('returns 400 when user already exists', async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: "exists" });

    const payload = {
      email: "you@example.com",
      username: "anmol",
      password: "abcdef",
      confirmPassword: "abcdef",
    };
    const req = new Request("http://localhost/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const res: any = await POST(req as any);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toBeDefined();
  });
});