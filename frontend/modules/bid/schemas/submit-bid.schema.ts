import { z } from "zod";

export const createBidSchema = z.object({
    proposedPrice: z.coerce
        .number({ message: "Enter a valid price" })
        .positive("Price must be greater than 0")
        .max(1_000_000, "Price cannot exceed $1,000,000"),

    coverLetter: z
        .string({ message: "Cover letter is required" })
        .min(50, "Cover letter must be at least 50 characters")
        .max(2000, "Cover letter must not exceed 2000 characters"),

    estimatedDays: z.coerce
        .number({ message: "Enter a valid number of days" })
        .int("Must be a whole number")
        .positive("Must be at least 1 day")
        .max(365, "Cannot exceed 365 days"),
});

export type CreateBidFormValues = z.infer<typeof createBidSchema>;