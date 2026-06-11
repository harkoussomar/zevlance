"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import type { LoginSchemaType } from "../schemas/login.schema";
import { authService } from "../api/auth.api";
import { parseApiError, ROLE_REDIRECT } from "@/modules/shared";

interface UseLoginReturn {
    login: (data: LoginSchemaType) => Promise<void>;
    isLoading: boolean;
    serverError: string | null;
    clearError: () => void;
}

export function useLogin(): UseLoginReturn {
    const router = useRouter();
    const storeLogin = useAuthStore((s) => s.login);

    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        return () => {
            abortRef.current?.abort();
        };
    }, []);

    const clearError = useCallback(() => setServerError(null), []);

    const login = useCallback(
        async (data: LoginSchemaType) => {
            abortRef.current?.abort();
            const controller = new AbortController();
            abortRef.current = controller;

            setIsLoading(true);
            setServerError(null);

            try {
                const authResponse = await authService.login(
                    data,
                    controller.signal,
                );
                storeLogin(authResponse);
                router.push(ROLE_REDIRECT[authResponse.role] ?? "/");
            } catch (err) {
                if ((err as Error).name === "AbortError") return;
                setServerError(
                    parseApiError(err, {
                        401: "Invalid email or password",
                        403: "Access denied",
                    }),
                );
            } finally {
                setIsLoading(false);
            }
        },
        [router, storeLogin],
    );

    return { login, isLoading, serverError, clearError };
}
