// ─── features/contracts/schemas/add-milestone.schema.ts ───────────────────────

import { z } from "zod";

const today = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const addMilestoneSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must not exceed 200 characters"),

  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .optional()
    .or(z.literal("")),

  amount: z.coerce
    .number({ message: "Enter a valid amount" })
    .positive("Amount must be greater than 0")
    .max(1_000_000, "Amount too large"),

  dueDate: z
    .string({ message: "Due date is required" })
    .min(1, "Due date is required")
    .refine(
      (d) => !isNaN(Date.parse(d)) && new Date(d) >= today(),
      "Due date must be today or a future date",
    ),
});

export type AddMilestoneFormValues = z.infer<typeof addMilestoneSchema>;