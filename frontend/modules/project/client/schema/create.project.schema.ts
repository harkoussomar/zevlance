// features/projects/schemas/project.schema.ts
import { z } from "zod";

const PROJECT_CATEGORIES = [
  "WEB_DEV",
  "MOBILE",
  "DESIGN",
  "DATA_SCIENCE",
  "DEVOPS",
  "WRITING",
  "MARKETING",
  "OTHER",
] as const;

export const projectSchema = z
  .object({
    title: z
      .string({ message: "Title is required" })
      .min(5, "Title must be at least 5 characters")
      .max(200, "Title must not exceed 200 characters"),

    description: z
      .string({ message: "Description is required" })
      .min(20, "Description must be at least 20 characters"),

    category: z.enum(PROJECT_CATEGORIES, {
      message: "Please select a category",
    }),

    budgetMin: z
      .number({ message: "Enter a valid minimum budget" })
      .positive("Minimum budget must be greater than 0"),

    budgetMax: z
      .number({ message: "Enter a valid maximum budget" })
      .positive("Maximum budget must be greater than 0"),

    deadline: z
      .string({ message: "Deadline is required" })
      .refine(
        (d) => !isNaN(Date.parse(d)) && new Date(d) > new Date(),
        "Deadline must be a future date",
      ),

    requiredSkills: z
      .array(z.string().min(1).max(50))
      .max(10, "Max 10 skills allowed")
      .default([]),
  })
  .refine((data) => data.budgetMax >= data.budgetMin, {
    message: "Max budget must be ≥ min budget",
    path: ["budgetMax"],
  });

export type ProjectFormValues = z.infer<typeof projectSchema>;
export type ProjectFormInput = z.input<typeof projectSchema>;
