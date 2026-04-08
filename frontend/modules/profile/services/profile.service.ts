// ─── features/profile/services/profile.service.ts ─────────────────────────────

import api from "@/modules/shared/lib/axios";
import type {
    BasicProfileResponse,
    ClientProfileResponse,
    FreelancerProfileResponse,
} from "../types";
import { ReviewResponse } from "@/modules/review/types";

// ─── Own Profile ───────────────────────────────────────────────────────────────

/**
 * GET /users/me
 * Returns minimal profile data for the authenticated user, regardless of role.
 * Use this for shared UI (sidebar, topbar) — avoids role-branching on the client.
 *
 * @throws 401 — if not authenticated
 */
export async function getMyBasicProfile(): Promise<BasicProfileResponse> {
    const { data } = await api.get<BasicProfileResponse>("/users/me");
    return data;
}

/**
 * GET /users/me/client-profile
 * Returns the full profile of the authenticated client.
 *
 * @role   CLIENT
 * @throws 403 — if the authenticated user is not a CLIENT
 */
export async function getMyClientProfile(): Promise<ClientProfileResponse> {
    const { data } = await api.get<ClientProfileResponse>(
        "/users/me/client-profile",
    );
    return data;
}

/**
 * GET /users/me/freelancer-profile
 * Returns the full profile of the authenticated freelancer.
 *
 * @role   FREELANCER
 * @throws 403 — if the authenticated user is not a FREELANCER
 */
export async function getMyFreelancerProfile(): Promise<FreelancerProfileResponse> {
    const { data } = await api.get<FreelancerProfileResponse>(
        "/users/me/freelancer-profile",
    );
    return data;
}

// ─── Public Freelancer Profile ────────────────────────────────────────────────

/**
 * GET /freelancers/{id}
 * Public — no auth required.
 *
 * @throws 404 — freelancer not found
 */
export async function getFreelancerProfile(
    id: string,
): Promise<FreelancerProfileResponse> {
    const { data } = await api.get<FreelancerProfileResponse>(
        `/freelancers/${id}`,
    );
    return data;
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

/**
 * GET /freelancers/{freelancerId}/reviews
 * Public — no auth required.
 */
export async function getFreelancerProfileReviews(
    freelancerId: string,
): Promise<ReviewResponse[]> {
    const { data } = await api.get<ReviewResponse[]>(
        `/freelancers/${freelancerId}/reviews`,
    );
    return data;
}

/**
 * GET /clients/{clientId}/reviews
 * Public — no auth required.
 */
export async function getClientProfileReviews(
    clientId: string,
): Promise<ReviewResponse[]> {
    const { data } = await api.get<ReviewResponse[]>(
        `/clients/${clientId}/reviews`,
    );
    return data;
}
