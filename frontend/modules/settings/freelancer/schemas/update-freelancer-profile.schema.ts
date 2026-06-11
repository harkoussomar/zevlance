import { z } from "zod";

export const updateFreelancerProfileSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must be under 100 characters")
        .optional()
        .or(z.literal(""))
        .nullable(),

    profilePicture: z
        .string()
        .url("Must be a valid URL")
        .optional()
        .or(z.literal(""))
        .nullable(),

    bio: z
        .string()
        .max(1000, "Bio must not exceed 1000 characters")
        .optional()
        .or(z.literal(""))
        .nullable(),

    hourlyRate: z.coerce
        .number()
        .positive("Hourly rate must be greater than 0")
        .max(10_000, "Hourly rate cannot exceed $10,000")
        .optional()
        .nullable(),

    skills: z
        .array(z.string().min(1).max(50))
        .max(20, "Max 20 skills allowed")
        .optional()
        .nullable(),
});

export type UpdateFreelancerProfileFormValues = z.infer<typeof updateFreelancerProfileSchema>;
