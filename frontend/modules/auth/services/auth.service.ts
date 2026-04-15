import api from "@/modules/shared/lib/axios";
import type {
    AuthResponse,
    LoginRequest,
    RegisterClientRequest,
    RegisterFreelancerRequest,
} from "../types";

export const authService = {
    async login(
        data: LoginRequest,
        signal?: AbortSignal,
    ): Promise<AuthResponse> {
        const { data: response } = await api.post<AuthResponse>(
            "/auth/login",
            data,
            { signal },
        );
        return response;
    },

    async registerFreelancer(
        data: RegisterFreelancerRequest,
        signal?: AbortSignal,
    ): Promise<AuthResponse> {
        const { data: response } = await api.post<AuthResponse>(
            "/auth/register/freelancer",
            data,
            { signal },
        );
        return response;
    },

    async registerClient(
        data: RegisterClientRequest,
        signal?: AbortSignal,
    ): Promise<AuthResponse> {
        const { data: response } = await api.post<AuthResponse>(
            "/auth/register/client",
            data,
            { signal },
        );
        return response;
    },

    async logout(signal?: AbortSignal): Promise<void> {
        await api.post<void>("/auth/logout", undefined, { signal });
    },

    async forgotPassword(email: string, signal?: AbortSignal): Promise<void> {
        await api.post<void>("/auth/forgot-password", { email }, { signal });
    },

    async resetPassword(
        token: string,
        newPassword: string,
        signal?: AbortSignal,
    ): Promise<void> {
        await api.post<void>(
            "/auth/reset-password",
            { token, newPassword },
            { signal },
        );
    },
} as const;
