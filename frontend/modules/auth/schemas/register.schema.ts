import { z } from "zod";

// ─── Shared base ──────────────────────────────────────────────────────────────

const baseSchema = z.object({
    name: z
        .string()
        .min(1, "Full name is required")
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must be under 100 characters"),
    email: z
        .string()
        .min(1, "Email is required")
        .email("Enter a valid email address"),
    password: z
        .string()
        .min(1, "Password is required")
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Must contain at least one uppercase letter")
        .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    phone: z.string().optional().or(z.literal("")),
});

const passwordMatch = (data: { password: string; confirmPassword: string }) =>
    data.password === data.confirmPassword;

// ─── Freelancer schema ────────────────────────────────────────────────────────

export const registerFreelancerSchema = baseSchema.refine(passwordMatch, {
    message: "Passwords do not match",
    path: ["confirmPassword"],   // ← mutable array, not "as const"
});

export type RegisterFreelancerSchemaType = z.infer<typeof registerFreelancerSchema>;

// ─── Client schema ────────────────────────────────────────────────────────────

export const registerClientSchema = baseSchema
    .extend({
        companyName: z
            .string()
            .max(100, "Company name must be under 100 characters")
            .optional()
            .or(z.literal("")),
        companyDescription: z
            .string()
            .max(500, "Description must be under 500 characters")
            .optional()
            .or(z.literal("")),
        website: z
            .url("Enter a valid URL (e.g. https://example.com)")
            .optional()
            .or(z.literal("")),
    })
    .refine(passwordMatch, {
        message: "Passwords do not match",
        path: ["confirmPassword"],   // ← mutable array, not "as const"
    });

export type RegisterClientSchemaType = z.infer<typeof registerClientSchema>;

// ─── Role schema ──────────────────────────────────────────────────────────────
// z.enum() in Zod v4 takes a tuple, not an object with required_error

export const roleSchema = z.object({
    role: z.enum(["FREELANCER", "CLIENT"]),
});

export type RoleSchemaType = z.infer<typeof roleSchema>;
