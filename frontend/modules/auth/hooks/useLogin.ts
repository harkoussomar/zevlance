"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { authService } from "../auth.service";
import type { LoginSchemaType } from "../schemas/login.schema";
import { LoginParseApiError } from "../utils/login-parse-api-error";
import { ROLE_REDIRECT } from "../utils/role-redirection";


export function useLogin() {
    const router = useRouter();
    const storeLogin = useAuthStore((s) => s.login);
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const login = async (data: LoginSchemaType) => {
        setIsLoading(true);
        setServerError(null);

        try {
            // 1. Call POST /auth/login
            const authResponse = await authService.login(data);

            // 2. Hydrate the Zustand store with the AuthResponse
            storeLogin(authResponse);

            router.push(ROLE_REDIRECT[authResponse.role] ?? "/");
        } catch (err) {
            setServerError(LoginParseApiError(err));
        } finally {
            setIsLoading(false);
        }
    };

    return { login, isLoading, serverError };
}
