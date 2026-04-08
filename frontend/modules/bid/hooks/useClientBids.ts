"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import type { BidFilters, BidResponse } from "../types";
import type { ContractResponse } from "@/modules/contracts/types";
import {
  acceptBid,
  getProjectBids,
  rejectBid,
} from "../services/client.bid.service";
import { bidKeys } from "./bid.keys";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Busts every bid-related cache entry for a given project.
 */
function invalidateProjectBids(qc: QueryClient, projectId: string) {
  return qc.invalidateQueries({ queryKey: bidKeys.project(projectId) });
}

// ─── useProjectBids ───────────────────────────────────────────────────────────

/**
 * Paginated list of bids on a specific project.
 * Only the client who owns the project should call this.
 *
 * - `signal` threaded through queryFn context for automatic cancellation
 *   on unmount or query key change (e.g. page/filter change).
 * - `placeholderData` keeps the previous page visible during pagination.
 * - `enabled` guards against empty-string projectId.
 */
export function useProjectBids(projectId: string, filters: BidFilters) {
  return useQuery({
    queryKey: bidKeys.projectList(projectId, filters),
    queryFn: ({ signal }) => getProjectBids(projectId, filters, signal),
    enabled: !!projectId,
    placeholderData: (prev) => prev,
  });
}

// ─── useAcceptBid ─────────────────────────────────────────────────────────────

type ProjectBidsPage = Awaited<ReturnType<typeof getProjectBids>>;

/**
 * Snapshot of every active project bids cache entry captured before the
 * optimistic update is applied. Used to roll back on error.
 */
type AcceptRejectContext = {
  previousSnapshots: [QueryKey, ProjectBidsPage | undefined][];
};

/**
 * Accept a bid. CLIENT only. Creates a Contract on the server automatically.
 *
 * Uses an optimistic update: flips the accepted bid's status to "ACCEPTED"
 * and all other PENDING bids to "REJECTED" immediately (accepting one bid
 * closes the project to further bids). Rolls back the full snapshot on error.
 *
 * - `onSettled` invalidates the project's bid list to sync server state.
 *
 * Note: `mutationFn` wraps `acceptBid` in an arrow rather than going
 * point-free because TanStack Query mutations do not receive an AbortSignal
 * automatically (unlike queries). Point-free would cause a type mismatch
 * between the optional `signal` param and TQ's internal `context` argument.
 *
 * @example
 * const { mutate, isPending } = useAcceptBid(projectId);
 * mutate(bid.id);
 */
export function useAcceptBid(projectId: string) {
  const qc = useQueryClient();

  return useMutation<ContractResponse, Error, string, AcceptRejectContext>({
    mutationFn: (id: string) => acceptBid(id),

    onMutate: async (bidId: string): Promise<AcceptRejectContext> => {
      await qc.cancelQueries({ queryKey: bidKeys.project(projectId) });

      const previousSnapshots = qc.getQueriesData<ProjectBidsPage>({
        queryKey: bidKeys.project(projectId),
      });

      qc.setQueriesData<ProjectBidsPage>(
        { queryKey: bidKeys.project(projectId) },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            content: old.content.map((bid) =>
              bid.id === bidId
                ? { ...bid, status: "ACCEPTED" as const }
                : { ...bid, status: "REJECTED" as const },
            ),
          };
        },
      );

      return { previousSnapshots };
    },

    onError: (_err, _bidId, context) => {
      if (!context) return;
      for (const [queryKey, data] of context.previousSnapshots) {
        qc.setQueryData(queryKey, data);
      }
    },

    onSettled: () => {
      invalidateProjectBids(qc, projectId);
    },
  });
}

// ─── useRejectBid ─────────────────────────────────────────────────────────────

/**
 * Reject a bid. CLIENT only.
 *
 * Uses an optimistic update: flips the rejected bid's status to "REJECTED"
 * in the cache instantly. Rolls back to the previous snapshot on error.
 *
 * Same signal/point-free caveat as useAcceptBid above.
 *
 * @example
 * const { mutate, isPending } = useRejectBid(projectId);
 * mutate(bid.id);
 */
export function useRejectBid(projectId: string) {
  const qc = useQueryClient();

  return useMutation<BidResponse, Error, string, AcceptRejectContext>({
    mutationFn: (id: string) => rejectBid(id),

    onMutate: async (bidId: string): Promise<AcceptRejectContext> => {
      await qc.cancelQueries({ queryKey: bidKeys.project(projectId) });

      const previousSnapshots = qc.getQueriesData<ProjectBidsPage>({
        queryKey: bidKeys.project(projectId),
      });

      qc.setQueriesData<ProjectBidsPage>(
        { queryKey: bidKeys.project(projectId) },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            content: old.content.map((bid) =>
              bid.id === bidId
                ? { ...bid, status: "REJECTED" as const }
                : bid,
            ),
          };
        },
      );

      return { previousSnapshots };
    },

    onError: (_err, _bidId, context) => {
      if (!context) return;
      for (const [queryKey, data] of context.previousSnapshots) {
        qc.setQueryData(queryKey, data);
      }
    },

    onSettled: () => {
      invalidateProjectBids(qc, projectId);
    },
  });
}