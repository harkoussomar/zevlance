import { z } from "zod";

export const forgotPasswordSchema = z.object({
    email: z.email("Enter a valid email address").min(1, "Email is required"),
});
export type ForgotPasswordSchemaType = z.infer<typeof forgotPasswordSchema>;

