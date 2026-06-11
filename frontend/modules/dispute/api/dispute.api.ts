// dispute/api/dispute.api.ts
import api from "@/modules/shared/lib/axios";
import type {
  DisputeDetailsResponse,
  DisputeMessageResponse,
  DisputeEvidenceResponse,
  ResolveDisputePayload,
} from "../types/dispute.types";

export async function getDisputeDetails(contractId: string, signal?: AbortSignal) {
  const { data } = await api.get<DisputeDetailsResponse>(
    `/contracts/${contractId}/dispute`,
    { signal }
  );
  return data;
}

export async function sendDisputeMessage(contractId: string, message: string) {
  const { data } = await api.post<DisputeMessageResponse>(
    `/contracts/${contractId}/dispute/messages`,
    { message }
  );
  return data;
}

export async function addDisputeEvidence(
  contractId: string,
  payload: { publicId: string; secureUrl: string; fileName: string }
) {
  const { data } = await api.post<DisputeEvidenceResponse>(
    `/contracts/${contractId}/dispute/evidence`,
    payload
  );
  return data;
}

export async function escalateDispute(contractId: string) {
  await api.put(`/contracts/${contractId}/dispute/escalate`);
}

/**
 * ADMIN ONLY — resolve a dispute and issue a ruling.
 * Backend endpoint: PUT /contracts/:contractId/dispute/resolve
 */
export async function resolveDispute(
  contractId: string,
  payload: ResolveDisputePayload
) {
  await api.put(`/contracts/${contractId}/dispute/resolve`, payload);
}
