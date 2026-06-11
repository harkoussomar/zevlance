import "server-only";
import { serverFetch } from "@/modules/shared/lib/bff/server-fetch";
import type {
    DisputeDetailsResponse,
    DisputeMessageResponse,
    DisputeEvidenceResponse,
    ResolveDisputePayload,
} from "../types/dispute.types";

export function getDisputeDetailsServer(contractId: string): Promise<DisputeDetailsResponse> {
    return serverFetch<DisputeDetailsResponse>(`/contracts/${contractId}/dispute`);
}

export function sendDisputeMessageServer(contractId: string, message: string): Promise<DisputeMessageResponse> {
    return serverFetch<DisputeMessageResponse>(`/contracts/${contractId}/dispute/messages`, {
        method: "POST",
        body: JSON.stringify({ message }),
    });
}

export function addDisputeEvidenceServer(contractId: string, payload: { publicId: string, secureUrl: string, fileName: string, description?: string }): Promise<DisputeEvidenceResponse> {
    return serverFetch<DisputeEvidenceResponse>(`/contracts/${contractId}/dispute/evidence`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export function escalateDisputeServer(contractId: string): Promise<void> {
    return serverFetch(`/contracts/${contractId}/dispute/escalate`, { method: "PUT" });
}

export function resolveDisputeServer(contractId: string, payload: ResolveDisputePayload): Promise<void> {
    return serverFetch(`/contracts/${contractId}/dispute/resolve`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}
