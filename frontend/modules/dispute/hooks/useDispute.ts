"use client";
// dispute/hooks/useDispute.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDisputeDetails,
  sendDisputeMessage,
  addDisputeEvidence,
  escalateDispute,
  resolveDispute,
} from "../api/dispute.api";
import type { DisputeDetailsResponse, DisputeMessageResponse, ResolveDisputePayload } from "../types/dispute.types";

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const disputeKeys = {
  detail: (contractId: string) => ["dispute", contractId] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useDisputeDetails(contractId: string) {
  return useQuery({
    queryKey: disputeKeys.detail(contractId),
    queryFn: ({ signal }) => getDisputeDetails(contractId, signal),
    refetchInterval: 5000,
    refetchIntervalInBackground: false, // stop polling when tab is not focused
    staleTime: 2000,
    enabled: Boolean(contractId),
  });
}

// ─── Message Mutation — with optimistic update ────────────────────────────────

export function useSendDisputeMessage(contractId: string) {
  const qc = useQueryClient();
  return useMutation({
    // Accept both the real message and a pre-built optimistic stub from the component
    mutationFn: ({ message }: { message: string; optimistic: DisputeMessageResponse }) =>
      sendDisputeMessage(contractId, message),

    onMutate: async ({ optimistic }) => {
      // Cancel in-flight refetches so they don't overwrite our optimistic data
      await qc.cancelQueries({ queryKey: disputeKeys.detail(contractId) });

      const snapshot = qc.getQueryData<DisputeDetailsResponse>(disputeKeys.detail(contractId));

      qc.setQueryData<DisputeDetailsResponse>(disputeKeys.detail(contractId), (old) => {
        if (!old) return old;
        return { ...old, messages: [...old.messages, optimistic] };
      });

      return { snapshot };
    },

    onError: (_err, _vars, context) => {
      // Rollback on failure
      if (context?.snapshot) {
        qc.setQueryData(disputeKeys.detail(contractId), context.snapshot);
      }
    },

    onSettled: () => {
      // Always sync with server to get the real message ID + any new messages
      qc.invalidateQueries({ queryKey: disputeKeys.detail(contractId) });
    },
  });
}

// ─── Evidence Mutation ────────────────────────────────────────────────────────

export function useAddDisputeEvidence(contractId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { publicId: string; secureUrl: string; fileName: string }) =>
      addDisputeEvidence(contractId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: disputeKeys.detail(contractId) }),
  });
}

// ─── Escalate Mutation ────────────────────────────────────────────────────────

export function useEscalateDispute(contractId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => escalateDispute(contractId),
    onSuccess: () => qc.invalidateQueries({ queryKey: disputeKeys.detail(contractId) }),
  });
}

// ─── Resolve Mutation (ADMIN only) ───────────────────────────────────────────
// Backend endpoint: PUT /contracts/:contractId/dispute/resolve

export function useResolveDispute(contractId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ResolveDisputePayload) => resolveDispute(contractId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: disputeKeys.detail(contractId) }),
  });
}
