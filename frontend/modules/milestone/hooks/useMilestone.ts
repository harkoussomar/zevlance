// ─── features/contracts/hooks/useMilestone.ts ─────────────────────────────────

import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import * as milestoneApi from "../services/milestone.service";
import type { CreateMilestoneRequest } from "../types";
import { contractKeys } from "@/modules/contracts/hooks/useContract";

// ─── Query Key Factory ─────────────────────────────────────────────────────────
//
// Keys follow the hierarchy:
//   ["milestones"]
//   ["milestones", "list", contractId]
//
// Invalidating the list key busts all milestone lists across all contracts.

export const milestoneKeys = {
  all: () => ["milestones"] as const,
  list: (contractId: string) =>
    ["milestones", "list", contractId] as const,
} as const;

// ─── Queries ───────────────────────────────────────────────────────────────────

/**
 * Fetch all milestones for a contract.
 * Only fetches when `contractId` is a non-empty string.
 *
 * @example
 * const { data: milestones, isPending } = useContractMilestones(contractId);
 */
export function useContractMilestones(contractId: string) {
  return useQuery({
    queryKey: milestoneKeys.list(contractId),
    queryFn: () => milestoneApi.getContractMilestones(contractId),
    enabled: Boolean(contractId),
  });
}

// ─── Mutations ─────────────────────────────────────────────────────────────────

/**
 * Create a new milestone on a contract (CLIENT only).
 * Invalidates the milestone list for the contract on success.
 *
 * @example
 * const { mutateAsync, isPending } = useCreateMilestone(contractId);
 * await mutateAsync({ title, amount, dueDate });
 */
export function useCreateMilestone(contractId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateMilestoneRequest) =>
      milestoneApi.createMilestone(contractId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: milestoneKeys.list(contractId) });
    },
  });
}

/**
 * Submit a deliverable URL for a milestone (FREELANCER only).
 * Transitions milestone: PENDING | REVISION_REQUESTED → SUBMITTED.
 *
 * @example
 * const { mutateAsync, isPending } = useSubmitDeliverable(contractId);
 * await mutateAsync({ milestoneId, deliverableUrl: "https://..." });
 */
export function useSubmitDeliverable(contractId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      milestoneId,
      deliverableUrl,
    }: {
      milestoneId: string;
      deliverableUrl: string;
    }) => milestoneApi.submitDeliverable(milestoneId, { deliverableUrl }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: milestoneKeys.list(contractId) });
    },
  });
}

/**
 * Approve a submitted milestone (CLIENT only).
 * Transitions milestone: SUBMITTED → APPROVED.
 * Also re-fetches the contract detail because all-milestones-approved
 * triggers an automatic contract completion on the server.
 *
 * @example
 * const { mutateAsync, isPending } = useApproveMilestone(contractId);
 * await mutateAsync(milestoneId);
 */
export function useApproveMilestone(contractId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (milestoneId: string) =>
      milestoneApi.approveMilestone(milestoneId),
    onSuccess: () => {
      // Bust both milestone list and contract detail (auto-complete may have fired)
      qc.invalidateQueries({ queryKey: milestoneKeys.list(contractId) });
      qc.invalidateQueries({ queryKey: contractKeys.detail(contractId) });
      qc.invalidateQueries({ queryKey: contractKeys.my() });
    },
  });
}

/**
 * Request a revision on a submitted milestone (CLIENT only).
 * Transitions milestone: SUBMITTED → REVISION_REQUESTED.
 * The freelancer may then re-submit a corrected deliverable.
 *
 * @example
 * const { mutateAsync, isPending } = useRequestRevision(contractId);
 * await mutateAsync(milestoneId);
 */
export function useRequestRevision(contractId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (milestoneId: string) =>
      milestoneApi.requestRevision(milestoneId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: milestoneKeys.list(contractId) });
    },
  });
}

/**
 * Fetch milestones for multiple contracts in parallel.
 * Returns an array of query results in the same order as `contractIds`.
 *
 * @example
 * const milestoneQueries = useActiveContractsMilestones(contracts.map(c => c.id));
 * milestoneQueries[0].data // milestones for contracts[0]
 */
export function useActiveContractsMilestones(contractIds: string[]) {
  return useQueries({
    queries: contractIds.map((contractId) => ({
      queryKey: milestoneKeys.list(contractId),
      queryFn: () => milestoneApi.getContractMilestones(contractId),
      enabled: Boolean(contractId),
    })),
  });
}