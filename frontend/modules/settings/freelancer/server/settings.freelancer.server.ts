import "server-only";
import { serverFetch } from "@/modules/shared/lib/bff/server-fetch";
import type { FreelancerProfileResponse } from "@/modules/profile/freelancer";
import type { UpdateFreelancerProfileRequest } from "../types/settings.freelancer";

export async function updateFreelancerProfileServer(
    payload: UpdateFreelancerProfileRequest,
): Promise<FreelancerProfileResponse> {
    return await serverFetch<FreelancerProfileResponse>(
        "/users/me/freelancer-profile",
        {
            method: "PATCH",
            body: JSON.stringify(payload),
        },
    );
}
