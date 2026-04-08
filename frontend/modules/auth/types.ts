import { Role } from "@/modules/shared/types";

export type SignupStep = "role" | "form";

export interface AuthResponse {
    email: string;
    role: Role;
    userId: string;
    name: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterFreelancerRequest {
    name: string;
    email: string;
    password: string;
    phone?: string;
}

export interface RegisterClientRequest {
    name: string;
    email: string;
    password: string;
    phone?: string;
    companyName?: string;
    companyDescription?: string;
    website?: string;
}
