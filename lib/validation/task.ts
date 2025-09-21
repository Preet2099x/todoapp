import { z } from "zod";

// Base schema with common fields
const baseTaskSchema = z.object({
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

// Schema for creating tasks (title required)
export const createTaskSchema = baseTaskSchema.extend({
  title: z.string().min(1, "Title is required"),
});

// Schema for updating tasks (all fields optional, but at least one required)
export const updateTaskSchema = baseTaskSchema.extend({
  title: z.string().min(1, "Title cannot be empty").optional(),
}).refine((data) => {
  // At least one field should be provided for updates
  return data.title !== undefined || data.description !== undefined || 
         data.dueDate !== undefined || data.completed !== undefined;
}, {
  message: "At least one field must be provided for updates",
});

// For backward compatibility, keep the original schema name pointing to create schema
export const taskSchema = createTaskSchema;