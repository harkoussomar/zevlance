import { z } from "zod";

export const submitDeliverableSchema = z.object({
    deliverableUrl: z
        .string({ message: "Deliverable URL is required" })
        .min(1, "Deliverable URL is required")
        .url("Must be a valid URL"),

    notes: z
        .string()
        .max(2000, "Notes must not exceed 2000 characters")
        .optional()
        .or(z.literal("")),
});

export type SubmitDeliverableFormValues = z.infer<typeof submitDeliverableSchema>;
