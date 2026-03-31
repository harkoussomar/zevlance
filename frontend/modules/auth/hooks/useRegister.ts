"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { authService } from "../auth.service";
import type {
    RegisterFreelancerSchemaType,
    RegisterClientSchemaType,
} from "../schemas/register.schema";

import { Role } from "@/types";
import { RegisterParseApiError } from "../utils/register-parse-api-error";
import { toFreelancerPayload } from "../utils/to-freelancer-payload";
import { toClientPayload } from "../utils/to-client-payload";
import { ROLE_REDIRECT } from "../utils/role-redirection";

// Overload for freelancer registration
// If role is "FREELANCER", the returned register function expects RegisterFreelancerSchemaType
export function useRegister(role: "FREELANCER"): {
    register: (data: RegisterFreelancerSchemaType) => Promise<void>;
    isLoading: boolean;
    serverError: string | null;
};

// Overload for client registration
// If role is "CLIENT", the returned register function expects RegisterClientSchemaType
export function useRegister(role: "CLIENT"): {
    register: (data: RegisterClientSchemaType) => Promise<void>;
    isLoading: boolean;
    serverError: string | null;
};

export function useRegister(role: Role) {
    const router = useRouter();
    const storeLogin = useAuthStore((s) => s.login);
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const register = async (
        data: RegisterFreelancerSchemaType | RegisterClientSchemaType,
    ) => {
        setIsLoading(true);
        setServerError(null);

        try {
            const authResponse =
                role === "FREELANCER"
                    ? await authService.registerFreelancer(
                          toFreelancerPayload(data),
                      )
                    : await authService.registerClient(toClientPayload(data));

            storeLogin(authResponse);
            router.push(ROLE_REDIRECT[authResponse.role] ?? "/");
        } catch (err) {
            setServerError(RegisterParseApiError(err));
        } finally {
            setIsLoading(false);
        }
    };

    return { register, isLoading, serverError };
}
