"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import type {
    RegisterFreelancerSchemaType,
    RegisterClientSchemaType,
} from "../schemas/register.schema";
import { Role } from "@/modules/shared/types";
import { toFreelancerPayload } from "../utils/to-freelancer-payload";
import { toClientPayload } from "../utils/to-client-payload";
import { authService } from "../api/auth.api";
import { parseApiError, ROLE_REDIRECT } from "@/modules/shared";

interface UseRegisterReturn<TData> {
    register: (data: TData) => Promise<void>;
    isLoading: boolean;
    serverError: string | null;
    clearError: () => void;
}

export function useRegister(
    role: "FREELANCER",
): UseRegisterReturn<RegisterFreelancerSchemaType>;
export function useRegister(
    role: "CLIENT",
): UseRegisterReturn<RegisterClientSchemaType>;
export function useRegister(
    role: Role,
): UseRegisterReturn<RegisterFreelancerSchemaType | RegisterClientSchemaType> {
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

    const register = useCallback(
        async (
            data: RegisterFreelancerSchemaType | RegisterClientSchemaType,
        ) => {
            abortRef.current?.abort();
            const controller = new AbortController();
            abortRef.current = controller;

            setIsLoading(true);
            setServerError(null);

            try {
                const authResponse =
                    role === "FREELANCER"
                        ? await authService.registerFreelancer(
                              toFreelancerPayload(data),
                              controller.signal,
                          )
                        : await authService.registerClient(
                              toClientPayload(data),
                              controller.signal,
                          );

                storeLogin(authResponse);
                router.push(ROLE_REDIRECT[authResponse.role] ?? "/");
            } catch (err) {
                if ((err as Error).name === "AbortError") return;
                setServerError(
                    parseApiError(err, {
                        409: "An account with this email already exists",
                        400: "Please check your details and try again",
                    }),
                );
            } finally {
                setIsLoading(false);
            }
        },
        [role, router, storeLogin],
    );

    return { register, isLoading, serverError, clearError };
}
