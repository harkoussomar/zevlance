import { z } from "zod";

export const leaveReviewSchema = z.object({
    rating: z.coerce
        .number({ message: "Rating is required" })
        .int("Rating must be a whole number")
        .min(1, "Rating must be at least 1")
        .max(5, "Rating must be at most 5"),

    comment: z
        .string()
        .max(1000, "Comment must not exceed 1000 characters")
        .optional()
        .or(z.literal("")),
});

export type LeaveReviewFormValues = z.infer<typeof leaveReviewSchema>;
