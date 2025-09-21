import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z
    .string()
    .transform((val) => val === "" ? undefined : val) // Transform empty string to undefined
    .optional()
    .refine((date) => {
  
      if (date === undefined) return true;
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) return false;
      const parsedDate = new Date(date + 'T00:00:00');
      return !isNaN(parsedDate.getTime());
    }, {
      message: "Date must be in YYYY-MM-DD format"
    }),
  completed: z.boolean().optional(),
});