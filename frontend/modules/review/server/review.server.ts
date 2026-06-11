import "server-only";
import { serverFetch } from "@/modules/shared/lib/bff/server-fetch";
import type { ReviewResponse } from "../types/review";

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
