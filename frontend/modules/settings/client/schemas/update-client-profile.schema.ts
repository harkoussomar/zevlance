import { z } from "zod";

export const updateClientProfileSchema = z.object({
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

    companyName: z
        .string()
        .max(100, "Company name must be under 100 characters")
        .optional()
        .or(z.literal(""))
        .nullable(),

    companyDescription: z
        .string()
        .max(500, "Description must be under 500 characters")
        .optional()
        .or(z.literal(""))
        .nullable(),

    website: z
        .string()
        .url("Enter a valid URL (e.g. https://example.com)")
        .optional()
        .or(z.literal(""))
        .nullable(),
});

export type UpdateClientProfileFormValues = z.infer<typeof updateClientProfileSchema>;
