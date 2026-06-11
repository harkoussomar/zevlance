import { z } from "zod";

export const changePasswordSchema = z
    .object({
        currentPassword: z
            .string({ message: "Current password is required" })
            .min(1, "Current password is required"),

        newPassword: z
            .string({ message: "New password is required" })
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Must contain at least one uppercase letter")
            .regex(/[0-9]/, "Must contain at least one number"),

        confirmNewPassword: z
            .string()
            .min(1, "Please confirm your new password"),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
        message: "Passwords do not match",
        path: ["confirmNewPassword"],
    });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
