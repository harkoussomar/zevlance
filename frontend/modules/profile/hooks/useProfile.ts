// ─── features/profile/hooks/useProfile.ts ─────────────────────────────────────

import { useQuery } from "@tanstack/react-query";
import * as profileApi from "../services/profile.service";
import { selectIsAuthenticated, useAuthStore } from "@/store/auth-store";

// ─── Query Key Factory ─────────────────────────────────────────────────────────
//
// Keys hierarchy:
//   ["profile"]
//   ["profile", "me", "client"]
//   ["profile", "me", "freelancer"]
//   ["profile", "freelancer", id]
//   ["profile", "reviews", "freelancer", id]
//   ["profile", "reviews", "client", id]

export const profileKeys = {
    all: () => ["profile"] as const,
    myBasic: () => ["profile", "me", "basic"] as const, // ← add
    myClient: () => ["profile", "me", "client"] as const,
    myFreelancer: () => ["profile", "me", "freelancer"] as const,
    freelancer: (id: string) => ["profile", "freelancer", id] as const,
    freelancerReviews: (id: string) =>
        ["profile", "reviews", "freelancer", id] as const,
    clientReviews: (id: string) =>
        ["profile", "reviews", "client", id] as const,
} as const;
// ─── Own profile ───────────────────────────────────────────────────────────────

/**
 * Fetches minimal profile data for the authenticated user (any role).
 * GET /users/me/basic
 * Intended for shared UI — sidebar, topbar, avatars.
 * Stale after 5 minutes — this data rarely changes mid-session.
 */
export function useMyBasicProfile() {
    const  isAuthenticated  = useAuthStore(selectIsAuthenticated);
    
    return useQuery({
        queryKey: profileKeys.myBasic(),
        queryFn: profileApi.getMyBasicProfile,
        enabled: isAuthenticated,
    });
}

/**
 * Fetches the authenticated client's full profile.
 * GET /users/me/client-profile
 */
export function useMyClientProfile() {
    const { role } = useAuthStore();
    return useQuery({
        queryKey: profileKeys.myClient(),
        queryFn: profileApi.getMyClientProfile,
        enabled: role === "CLIENT",
    });
}

/**
 * Fetches the authenticated freelancer's full profile.
 * GET /users/me/freelancer-profile
 */
export function useMyFreelancerProfile() {
    const { role } = useAuthStore();
    return useQuery({
        queryKey: profileKeys.myFreelancer(),
        queryFn: profileApi.getMyFreelancerProfile,
        enabled: role === "FREELANCER",
    });
}

// ─── Public freelancer profile ─────────────────────────────────────────────────

/**
 * Fetch a freelancer's public profile by ID.
 * GET /freelancers/{id} — no auth required.
 * Stale after 5 minutes.
 */
export function useFreelancerProfile(id: string) {
    return useQuery({
        queryKey: profileKeys.freelancer(id),
        queryFn: () => profileApi.getFreelancerProfile(id),
        enabled: Boolean(id),
        staleTime: 5 * 60 * 1000,
    });
}

// ─── Reviews ───────────────────────────────────────────────────────────────────

/**
 * Fetch all reviews received by a freelancer.
 * GET /freelancers/{freelancerId}/reviews — no auth required.
 */
export function useFreelancerProfileReviews(freelancerId: string) {
    return useQuery({
        queryKey: profileKeys.freelancerReviews(freelancerId),
        queryFn: () => profileApi.getFreelancerProfileReviews(freelancerId),
        enabled: Boolean(freelancerId),
    });
}

/**
 * Fetch all reviews received by a client.
 * GET /clients/{clientId}/reviews — no auth required.
 */
export function useClientProfileReviews(clientId: string) {
    return useQuery({
        queryKey: profileKeys.clientReviews(clientId),
        queryFn: () => profileApi.getClientProfileReviews(clientId),
        enabled: Boolean(clientId),
    });
}
