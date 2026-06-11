import { z } from "zod";

export const resetPasswordSchema = z
    .object({
        token: z.string().min(1, "Token is required"), // Keep token here for the server
        newPassword: z
            .string()
            .min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
    })
   .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path:["confirmPassword"],
    });

export type ResetPasswordSchemaType = z.infer<typeof resetPasswordSchema>;
