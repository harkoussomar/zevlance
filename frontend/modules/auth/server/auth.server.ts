import "server-only";
import { proxyToSpring } from "@/modules/shared/lib/bff/proxy-fetch";
import type { NextRequest } from "next/server";
import type { LoginSchemaType } from "../schemas/login.schema";
import type { ForgotPasswordSchemaType } from "../schemas/forgot-password.schema";

// Stripped types — confirmPassword is removed before reaching the server layer
type RegisterPayload = {
    name: string;
    email: string;
    password: string;
    phone?: string;
    companyName?: string;
    companyDescription?: string;
    website?: string;
};

type ResetPasswordPayload = {
    token: string;
    newPassword: string;
};

export async function loginServer(body: LoginSchemaType) {
    return proxyToSpring("/auth/login", { method: "POST", body });
}

export async function registerClientServer(body: RegisterPayload) {
    return proxyToSpring("/auth/register/client", { method: "POST", body });
}

export async function registerFreelancerServer(body: RegisterPayload) {
    return proxyToSpring("/auth/register/freelancer", { method: "POST", body });
}

export async function logoutServer(_req: NextRequest) {
    return proxyToSpring("/auth/logout", { method: "POST" });
}

export async function forgotPasswordServer(body: ForgotPasswordSchemaType) {
    return proxyToSpring("/auth/forgot-password", { method: "POST", body });
}

export async function resetPasswordServer(body: ResetPasswordPayload) {
    return proxyToSpring("/auth/reset-password", { method: "POST", body });
}

export async function verifyEmailServer(token: string) {
    const safe = encodeURIComponent(token);
    return proxyToSpring(`/auth/verify-email?token=${safe}`, {
        method: "POST",
    });
}