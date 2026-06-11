import api from "@/modules/shared/lib/axios";
import type {
    ContractResponse,
    ContractSummaryResponse,
    ContractStatus,
} from "../types/contract.shared";
import { PaginatedResponse } from "@/modules/shared/types";
import type { FileDisputePayload } from "@/modules/dispute/types/dispute.types";

export interface GetMyContractsParams {
    status?: ContractStatus | "ALL" ;
    page?: number;
    size?: number;
}

// ─── List (paginated + filtered) ─────────────────────────────────────────────

export async function getMyContracts(
    params: GetMyContractsParams = {},
    signal?: AbortSignal,
): Promise<PaginatedResponse<ContractResponse>> {
    const { status, page = 0, size = 10 } = params;
    const { data } = await api.get<PaginatedResponse<ContractResponse>>("/contracts/my", {
        params: {
            ...(status && status !== "ALL" ? { status } : {}),
            page,
            size,
        },
        signal,
    });
    return data;
}

// ─── Summary (full-history stat cards, pagination-independent) ────────────────

export async function getMyContractsSummary(
    signal?: AbortSignal,
): Promise<ContractSummaryResponse> {
    const { data } = await api.get<ContractSummaryResponse>("/contracts/my/summary", { signal });
    return data;
}

// ─── Single contract ──────────────────────────────────────────────────────────

export async function getContract(
    id: string,
    signal?: AbortSignal,
): Promise<ContractResponse> {
    const { data } = await api.get<ContractResponse>(`/contracts/${id}`, { signal });
    return data;
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function cancelContract(
    id: string,
    signal?: AbortSignal,
): Promise<ContractResponse> {
    const { data } = await api.put<ContractResponse>(`/contracts/${id}/cancel`, undefined, { signal });
    return data;
}

export async function disputeContract(
    id: string,
    payload: FileDisputePayload,
    signal?: AbortSignal,
): Promise<ContractResponse> {
    const { data } = await api.put<ContractResponse>(`/contracts/${id}/dispute`, payload, { signal });
    return data;
}
