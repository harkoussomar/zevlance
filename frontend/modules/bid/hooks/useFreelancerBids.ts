"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import type { BidFilters, BidResponse, CreateBidRequest } from "../types";
import {
  createBid,
  getMyBids,
  withdrawBid,
} from "../services/freelancer.bid.service";
import { bidKeys } from "./bid.keys";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Busts every bid-related cache entry.
 * Used when projectId is not in scope or when a mutation affects multiple keys.
 */
function invalidateAllBids(qc: QueryClient) {
  return qc.invalidateQueries({ queryKey: bidKeys.all() });
}

// ─── useMyBids ────────────────────────────────────────────────────────────────

/**
 * Paginated list of the authenticated freelancer's own bids.
 *
 * - `signal` threaded through queryFn context for automatic cancellation
 *   on unmount or filter/page change.
 * - `placeholderData` keeps the previous page visible while the next page
 *   loads, preventing layout shift during pagination.
 * - `staleTime` is intentionally omitted so callers can override it via
 *   `queryClient.setDefaultOptions` in their app config.
 *
 * @example
 * const { data, isPlaceholderData, isPending } = useMyBids({ page: 0, size: 10 });
 */
export function useMyBids(filters: BidFilters) {
  return useQuery({
    queryKey: bidKeys.myList(filters),
    queryFn: ({ signal }) => getMyBids(filters, signal),
    placeholderData: (previousData) => previousData,
  });
}

// ─── useMyBid ─────────────────────────────────────────────────────────────────

/**
 * Returns the authenticated freelancer's bid on a specific project, if any.
 * Fetches from GET /bids/my and filters client-side since the API has no
 * per-project endpoint for freelancers. Disabled when the user is not a
 * freelancer or projectId is absent.
 *
 * Key lives under `bidKeys.myBid(projectId)` → ["bids", "my", "project", id]
 * to avoid a cache collision with the client-side `bidKeys.project(id)` key
 * which returns a different data shape (paginated list vs. single bid).
 *
 * @example
 * const { data: myBid, isLoading } = useMyBid(projectId, isFreelancer);
 */
export function useMyBid(projectId: string, enabled: boolean) {
  return useQuery({
    queryKey: bidKeys.myBid(projectId),
    queryFn: async ({ signal }) => {
      // Fetch the first page with a large size — a freelancer realistically
      // won't have hundreds of bids, so one request is sufficient.
      const page = await getMyBids({ page: 0, size: 100 }, signal);
      return page.content.find((bid) => bid.projectId === projectId) ?? null;
    },
    enabled: enabled && !!projectId,
  });
}

// ─── useCreateBid ─────────────────────────────────────────────────────────────

/**
 * Submit a new bid on a project. FREELANCER only.
 *
 * - `projectId` is captured at hook level so call sites only pass the payload:
 *   `mutate(payload)` instead of `mutate({ projectId, payload })`.
 * - On success: invalidates all bid cache entries so both the paginated list
 *   and the per-project `useMyBid` reflect the new bid immediately.
 *
 * Caller is responsible for handling the 409 (duplicate bid) and 400 (project
 * closed) errors via the returned `error` value or an `onError` callback.
 *
 * Note: `mutationFn` wraps `createBid` in an arrow rather than going
 * point-free because TanStack Query mutations do not receive an AbortSignal
 * automatically (unlike queries). Point-free would cause a type mismatch
 * between the optional `signal` param and TQ's internal `context` argument.
 *
 * @example
 * const { mutate, isPending, error } = useCreateBid(projectId);
 * mutate({ proposedPrice: 1200, coverLetter: "...", estimatedDays: 14 });
 */
export function useCreateBid(projectId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBidRequest) => createBid(projectId, payload),
    onSuccess: async () => {
      await invalidateAllBids(qc);
    },
  });
}

// ─── useWithdrawBid ───────────────────────────────────────────────────────────

type MyBidsPage = Awaited<ReturnType<typeof getMyBids>>;

/**
 * Snapshot of every active "my bids" cache entry captured before the
 * optimistic update is applied. Used to roll back on error.
 */
type WithdrawContext = {
  previousSnapshots: [QueryKey, MyBidsPage | undefined][];
};

/**
 * Withdraw one of the freelancer's own PENDING bids.
 *
 * Uses an optimistic update: flips the bid's status to "WITHDRAWN" in the
 * cache instantly, then rolls back if the server returns an error.
 *
 * - The optimistic update is applied across ALL active "my list" cache entries
 *   so every page the user has open stays consistent.
 * - On error the previous snapshot is restored before the server error is
 *   surfaced, so the UI never shows a stale "WITHDRAWN" state on failure.
 * - `onSettled` busts all bid entries (including `useMyBid`'s key) to ensure
 *   the server state is the final source of truth.
 *
 * Note: same arrow-wrap caveat as useCreateBid above.
 *
 * @example
 * const { mutate, isPending } = useWithdrawBid();
 * mutate(bid.id);
 */
export function useWithdrawBid() {
  const qc = useQueryClient();

  return useMutation<BidResponse, Error, string, WithdrawContext>({
    mutationFn: (bidId: string) => withdrawBid(bidId),

    onMutate: async (bidId: string): Promise<WithdrawContext> => {
      await qc.cancelQueries({ queryKey: bidKeys.mine() });

      const previousSnapshots = qc.getQueriesData<MyBidsPage>({
        queryKey: bidKeys.mine(),
      });

      qc.setQueriesData<MyBidsPage>(
        { queryKey: bidKeys.mine() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            content: old.content.map((bid) =>
              bid.id === bidId
                ? { ...bid, status: "WITHDRAWN" as const }
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
      invalidateAllBids(qc);
    },
  });
}