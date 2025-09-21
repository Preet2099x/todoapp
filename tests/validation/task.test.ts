// tests/validation/task.test.ts
import { taskSchema } from "@/lib/validation/task";

describe('Task validation (Zod)', () => {
  test('taskSchema accepts minimal valid task', () => {
    const ok = { title: "Buy milk" };
    const parsed = taskSchema.safeParse(ok);
    expect(parsed.success).toBe(true);
  });

  test('taskSchema rejects empty title', () => {
    const bad = { title: "" };
    const parsed = taskSchema.safeParse(bad);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0].message).toMatch(/Title is required/i);
    }
  });

  test('taskSchema accepts YYYY-MM-DD dueDate', () => {
    const ok = { title: "Task", dueDate: "2025-09-21" };
    const parsed = taskSchema.safeParse(ok);
    expect(parsed.success).toBe(true);
  });
});