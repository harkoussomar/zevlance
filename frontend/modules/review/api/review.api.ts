import api from "@/modules/shared/lib/axios";
import type { LeaveReviewRequest, ReviewResponse } from "../types/review";

export async function leaveReview(
    contractId: string,
    payload: LeaveReviewRequest,
    signal?: AbortSignal,
): Promise<ReviewResponse> {
    const { data } = await api.post<ReviewResponse>(
        `/contracts/${contractId}/reviews`,
        payload,
        { signal },
    );
    return data;
}

export async function getFreelancerReviews(
    freelancerId: string,
    signal?: AbortSignal,
): Promise<ReviewResponse[]> {
    const { data } = await api.get<ReviewResponse[]>(
        `/freelancers/${freelancerId}/reviews`,
        { signal },
    );
    return data;
}

export async function getClientReviews(
    clientId: string,
    signal?: AbortSignal,
): Promise<ReviewResponse[]> {
    const { data } = await api.get<ReviewResponse[]>(
        `/clients/${clientId}/reviews`,
        { signal },
    );
    return data;
}
