import "server-only";
import { serverFetch } from "@/modules/shared/lib/server-fetch";
import { FreelancerProfileResponse } from "../../freelancer";
import type { ReviewResponse } from "@/modules/review";

export async function getFreelancerProfileServer(
    id: string,
): Promise<FreelancerProfileResponse> {
    return await serverFetch<FreelancerProfileResponse>(`/freelancers/${id}`, {
        next: { revalidate: 300, tags: ["profile", `freelancer-${id}`] },
    });
}

export async function getFreelancerReviewsServer(
    freelancerId: string,
): Promise<ReviewResponse[]> {
    return await serverFetch<ReviewResponse[]>(
        `/freelancers/${freelancerId}/reviews`,
        {
            next: {
                revalidate: 300,
                tags: ["reviews", `freelancer-${freelancerId}`],
            },
        },
    );
}

export async function getClientReviewsServer(
    clientId: string,
): Promise<ReviewResponse[]> {
    return await serverFetch<ReviewResponse[]>(`/clients/${clientId}/reviews`, {
        next: { revalidate: 300, tags: ["reviews", `client-${clientId}`] },
    });
}
