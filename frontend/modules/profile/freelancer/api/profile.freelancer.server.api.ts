import "server-only";
import { serverFetch } from "@/modules/shared/lib/bff/server-fetch";
import type { FreelancerProfileResponse } from "../types/profile.freelancer";

export async function getMyFreelancerProfileServer(): Promise<FreelancerProfileResponse> {
    return await serverFetch<FreelancerProfileResponse>(
        "/users/me/freelancer-profile",
    );
}
