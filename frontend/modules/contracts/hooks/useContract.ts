// ─── features/contracts/hooks/useContract.ts ──────────────────────────────────
//
// Queries and mutations for contract-level operations.
// Milestone and review hooks live in their own files.

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import type { ContractResponse, ContractStatus } from "../types";
import {
  getMyContracts,
  getContract,
  completeContract,
  cancelContract,
  disputeContract,
} from "../services/contract.service";

// ─── Query Key Factory ────────────────────────────────────────────────────────
//
// Keys follow the hierarchy:
//   ["contracts"]
//   ["contracts", "my"]
//   ["contracts", "detail", contractId]
//
// Invalidating `all()` busts every contract query.
// Exported so milestone/review hooks can cross-invalidate contract detail.

export const contractKeys = {
  all: () => ["contracts"] as const,
  my: () => ["contracts", "my"] as const,
  detail: (id: string) => ["contracts", "detail", id] as const,
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Applies an optimistic status update to both the list cache and the detail
 * cache so both views stay in sync without a round-trip.
 */
function applyOptimisticStatus(
  qc: QueryClient,
  id: string,
  status: ContractStatus,
) {
  qc.setQueryData<ContractResponse[]>(contractKeys.my(), (old) =>
    old?.map((c) => (c.id === id ? { ...c, status } : c)),
  );
  qc.setQueryData<ContractResponse>(contractKeys.detail(id), (old) =>
    old ? { ...old, status } : old,
  );
}

/**
 * Invalidates both the list and detail cache after a mutation settles so the
 * cache is guaranteed to reflect server state regardless of optimistic result.
 */
function invalidateContract(qc: QueryClient, id: string) {
  return Promise.all([
    qc.invalidateQueries({ queryKey: contractKeys.my() }),
    qc.invalidateQueries({ queryKey: contractKeys.detail(id) }),
  ]);
}

// ─── Shared context type for status-change mutations ─────────────────────────

type StatusMutationContext = {
  previousList: ContractResponse[] | undefined;
  previousDetail: ContractResponse | undefined;
};

/**
 * Factory that builds a useMutation hook for any contract status-change action.
 *
 * - Applies an optimistic update to both list and detail caches immediately.
 * - Rolls back both snapshots atomically on error.
 * - Always invalidates after settle to sync server state.
 *
 * The `mutationFn` parameter is typed as `(id: string) => Promise<ContractResponse>`
 * rather than the raw service function type. This sidesteps the point-free
 * AbortSignal/context type collision (see bid hooks for the full explanation) —
 * the factory wraps the call so TanStack Query never sees the optional signal param.
 */
function useContractStatusMutation(
  mutationFn: (id: string) => Promise<ContractResponse>,
  nextStatus: ContractStatus,
) {
  const qc = useQueryClient();

  return useMutation<ContractResponse, Error, string, StatusMutationContext>({
    mutationFn,

    onMutate: async (id): Promise<StatusMutationContext> => {
      await Promise.all([
        qc.cancelQueries({ queryKey: contractKeys.my() }),
        qc.cancelQueries({ queryKey: contractKeys.detail(id) }),
      ]);

      const previousList = qc.getQueryData<ContractResponse[]>(contractKeys.my());
      const previousDetail = qc.getQueryData<ContractResponse>(contractKeys.detail(id));

      applyOptimisticStatus(qc, id, nextStatus);
      return { previousList, previousDetail };
    },

    onError: (_err, id, context) => {
      if (!context) return;
      qc.setQueryData(contractKeys.my(), context.previousList);
      qc.setQueryData(contractKeys.detail(id), context.previousDetail);
    },

    onSettled: (_data, _err, id) => {
      invalidateContract(qc, id);
    },
  });
}

// ─── useMyContracts ───────────────────────────────────────────────────────────

/**
 * Fetch all contracts for the authenticated user (CLIENT or FREELANCER).
 *
 * @example
 * const { data, isPending } = useMyContracts();
 */
export function useMyContracts() {
  return useQuery({
    queryKey: contractKeys.my(),
    queryFn: ({ signal }) => getMyContracts(signal),
  });
}

// ─── useContract ──────────────────────────────────────────────────────────────

/**
 * Fetch a single contract by ID.
 * Only fetches when `id` is a non-empty string.
 *
 * @example
 * const { data: contract, isPending } = useContract(contractId);
 */
export function useContract(id: string) {
  return useQuery({
    queryKey: contractKeys.detail(id),
    queryFn: ({ signal }) => getContract(id, signal),
    enabled: Boolean(id),
  });
}

// ─── useCompleteContract ──────────────────────────────────────────────────────

/**
 * Mark a contract as COMPLETED (CLIENT only).
 * Optimistically flips status to "COMPLETED", rolls back on error.
 *
 * @example
 * const { mutate, isPending } = useCompleteContract();
 * mutate(contractId);
 */
export function useCompleteContract() {
  return useContractStatusMutation(completeContract, "COMPLETED");
}

// ─── useCancelContract ────────────────────────────────────────────────────────

/**
 * Cancel a contract (CLIENT or FREELANCER).
 * Optimistically flips status to "CANCELLED".
 *
 * @example
 * const { mutate, isPending } = useCancelContract();
 * mutate(contractId);
 */
export function useCancelContract() {
  return useContractStatusMutation(cancelContract, "CANCELLED");
}

// ─── useDisputeContract ───────────────────────────────────────────────────────

/**
 * Open a dispute on a contract (CLIENT or FREELANCER).
 * Optimistically flips status to "DISPUTED".
 *
 * @example
 * const { mutate, isPending } = useDisputeContract();
 * mutate(contractId);
 */
export function useDisputeContract() {
  return useContractStatusMutation(disputeContract, "DISPUTED");
}