// ─── features/contracts/hooks/useReview.ts ────────────────────────────────────

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getClientReviews, getFreelancerReviews, leaveReview } from "../services/review.service";
import { LeaveReviewRequest } from "../types";
import { contractKeys } from "@/modules/contracts/hooks/useContract";


// ─── Query Key Factory ─────────────────────────────────────────────────────────

export const reviewKeys = {
  all: () => ["reviews"] as const,
  freelancer: (freelancerId: string) =>
    ["reviews", "freelancer", freelancerId] as const,
  client: (clientId: string) => ["reviews", "client", clientId] as const,
} as const;

// ─── Queries ───────────────────────────────────────────────────────────────────

/**
 * Fetch all reviews for a freelancer.
 * Public — no auth required. Only fetches when freelancerId is non-empty.
 *
 * @example
 * const { data: reviews } = useFreelancerReviews(freelancerId);
 */
export function useFreelancerReviews(freelancerId: string) {
  return useQuery({
    queryKey: reviewKeys.freelancer(freelancerId),
    queryFn: () => getFreelancerReviews(freelancerId),
    enabled: Boolean(freelancerId),
  });
}

/**
 * Fetch all reviews for a client.
 * Public — no auth required. Only fetches when clientId is non-empty.
 *
 * @example
 * const { data: reviews } = useClientReviews(clientId);
 */
export function useClientReviews(clientId: string) {
  return useQuery({
    queryKey: reviewKeys.client(clientId),
    queryFn: () => getClientReviews(clientId),
    enabled: Boolean(clientId),
  });
}

// ─── Mutations ─────────────────────────────────────────────────────────────────

/**
 * Leave a review for the other party on a completed contract.
 * Re-fetches the contract detail on success so status badges stay fresh.
 *
 * @example
 * const { mutateAsync, isPending } = useLeaveReview(contractId);
 * await mutateAsync({ rating: 5, comment: "Great work!" });
 */
export function useLeaveReview(contractId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: LeaveReviewRequest) =>
      leaveReview(contractId, payload),
    onSuccess: (_data, _vars) => {
      // Refresh the contract so the UI knows review state
      qc.invalidateQueries({ queryKey: contractKeys.detail(contractId) });
    },
  });
}