// tests/validation/auth.test.ts
import { signupSchema, loginSchema } from "@/lib/validation/auth";

describe('Auth validation (Zod)', () => {
  test('signupSchema accepts valid input', () => {
    const valid = {
      email: "you@example.com",
      username: "anmol",
      password: "abcdef",
      confirmPassword: "abcdef",
    };
    const parsed = signupSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  test('signupSchema rejects mismatch passwords', () => {
    const bad = {
      email: "you@example.com",
      username: "anmol",
      password: "abcdef",
      confirmPassword: "abcxxx",
    };
    const parsed = signupSchema.safeParse(bad);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      // confirm the refined error mentions password mismatch
      expect(parsed.error.issues.some(i => i.message.includes('Passwords do not match'))).toBe(true);
    }
  });

  test('loginSchema rejects bad email', () => {
    const bad = { email: "not-an-email", password: "abcdef" };
    const parsed = loginSchema.safeParse(bad);
    expect(parsed.success).toBe(false);
  });
});