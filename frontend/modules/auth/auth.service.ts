import api from "@/lib/axios";
import type { AuthResponse, LoginRequest, RegisterClientRequest, RegisterFreelancerRequest } from "./types";

export const authService = {
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const res = await api.post<AuthResponse>("/auth/login", data);
        return res.data;
    },

    registerFreelancer: async (data: RegisterFreelancerRequest): Promise<AuthResponse> => {
        const res = await api.post<AuthResponse>("/auth/register/freelancer", data);
        return res.data;
    },

    registerClient: async (data: RegisterClientRequest): Promise<AuthResponse> => {
        const res = await api.post<AuthResponse>("/auth/register/client", data);
        return res.data;
    },
};