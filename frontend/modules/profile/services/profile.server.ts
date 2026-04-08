import "server-only";

// ─── features/profile/services/profile.server.ts ──────────────────────────────
//
// Server-only service functions for the profile feature.
// These run exclusively in RSC / Server Actions — never import from client code.

import { serverFetch } from "@/modules/shared/lib/server-fetch";
import type {
    BasicProfileResponse,
    ClientProfileResponse,
    FreelancerProfileResponse,
} from "../types";
import type { ReviewResponse } from "@/modules/review/types";

export const getMyBasicProfileServer =
    (): Promise<BasicProfileResponse> =>
        serverFetch("/users/me");

export const getMyClientProfileServer =
    (): Promise<ClientProfileResponse> =>
        serverFetch("/users/me/client-profile");

export const getMyFreelancerProfileServer =
    (): Promise<FreelancerProfileResponse> =>
        serverFetch("/users/me/freelancer-profile");

export const getFreelancerProfileServer =
    (id: string): Promise<FreelancerProfileResponse> =>
        serverFetch(`/freelancers/${id}`, { revalidate: 300 }); // 5 min — public data

export const getFreelancerReviewsServer =
    (freelancerId: string): Promise<ReviewResponse[]> =>
        serverFetch(`/freelancers/${freelancerId}/reviews`, { revalidate: 300 });

export const getClientReviewsServer =
    (clientId: string): Promise<ReviewResponse[]> =>
        serverFetch(`/clients/${clientId}/reviews`, { revalidate: 300 });