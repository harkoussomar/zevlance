// ─── features/contracts/services/review.service.ts ────────────────────────────

import api from "@/modules/shared/lib/axios";
import { LeaveReviewRequest, ReviewResponse } from "../types";

// ─── Leave Review ──────────────────────────────────────────────────────────────

/**
 * Leave a review for the other party on a completed contract.
 * The reviewer is determined automatically from the auth token:
 * CLIENT → reviews the freelancer; FREELANCER → reviews the client.
 *
 * The contract must have status COMPLETED before a review can be submitted.
 * Each party may only leave one review per contract (409 if already submitted).
 *
 * @role    CLIENT | FREELANCER
 * @method  POST /contracts/{contractId}/reviews
 * @returns 201 Created — ReviewResponse
 * @throws  400 — contract not COMPLETED
 * @throws  409 — review already submitted
 */
export async function leaveReview(
    contractId: string,
    payload: LeaveReviewRequest,
): Promise<ReviewResponse> {
    const { data } = await api.post<ReviewResponse>(
        `/contracts/${contractId}/reviews`,
        payload,
    );
    return data;
}

// ─── Read Reviews ──────────────────────────────────────────────────────────────

/**
 * Fetch all reviews left for a freelancer across all their completed contracts.
 * Public — no auth token required.
 *
 * @method  GET /freelancers/{freelancerId}/reviews
 * @returns 200 OK — ReviewResponse[]
 */
export async function getFreelancerReviews(
    freelancerId: string,
): Promise<ReviewResponse[]> {
    const { data } = await api.get<ReviewResponse[]>(
        `/freelancers/${freelancerId}/reviews`,
    );
    return data;
}

/**
 * Fetch all reviews left for a client across all their completed contracts.
 * Public — no auth token required.
 *
 * @method  GET /clients/{clientId}/reviews
 * @returns 200 OK — ReviewResponse[]
 */
export async function getClientReviews(
    clientId: string,
): Promise<ReviewResponse[]> {
    const { data } = await api.get<ReviewResponse[]>(
        `/clients/${clientId}/reviews`,
    );
    return data;
}
