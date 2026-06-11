import "server-only";
import { serverFetch } from "@/modules/shared/lib/bff/server-fetch";
import type {
    ContractResponse,
    ContractSummaryResponse,
    ContractStatus,
} from "../types/contract.shared";
import type { PaginatedResponse } from "@/modules/shared/types";
import type { MilestoneResponse } from "@/modules/milestone/shared/types/milestone.shared";
import type { ReviewResponse } from "@/modules/review/types/review";
import type { FileDisputePayload } from "@/modules/dispute/types/dispute.types";

export async function getContractServer(id: string): Promise<ContractResponse> {
    return await serverFetch<ContractResponse>(`/contracts/${id}`);
}

export async function completeContractServer(
    id: string,
): Promise<ContractResponse> {
    return await serverFetch<ContractResponse>(`/contracts/${id}/complete`, {
        method: "PUT",
    });
}

export async function cancelContractServer(
    id: string,
): Promise<ContractResponse> {
    return await serverFetch<ContractResponse>(`/contracts/${id}/cancel`, {
        method: "PUT",
    });
}

// Replace the old disputeContractServer with this:
export async function disputeContractServer(
    id: string,
    payload: FileDisputePayload
): Promise<ContractResponse> {
    return await serverFetch<ContractResponse>(`/contracts/${id}/dispute`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function getContractMilestonesServer(
    id: string,
): Promise<MilestoneResponse[]> {
    return await serverFetch<MilestoneResponse[]>(
        `/contracts/${id}/milestones`,
    );
}

export async function createContractMilestoneServer(
    id: string,
    body: unknown,
): Promise<MilestoneResponse> {
    return await serverFetch<MilestoneResponse>(`/contracts/${id}/milestones`, {
        method: "POST",
        body: JSON.stringify(body),
    });
}

export async function leaveContractReviewServer(
    id: string,
    body: unknown,
): Promise<ReviewResponse> {
    return await serverFetch<ReviewResponse>(`/contracts/${id}/reviews`, {
        method: "POST",
        body: JSON.stringify(body),
    });
}

export interface GetMyContractsParams {
    status?: ContractStatus | "ALL";
    page?: number;
    size?: number;
}

export async function getMyContractsServer(
    params: GetMyContractsParams = {},
): Promise<PaginatedResponse<ContractResponse>> {
    const { status, page = 0, size = 10 } = params;

    const qs = new URLSearchParams();

    if (status && status !== "ALL") qs.set("status", String(status));

    qs.set("page", String(page));
    qs.set("size", String(size));

    return await serverFetch<PaginatedResponse<ContractResponse>>(
        `/contracts/my?${qs.toString()}`,
    );
}

export async function getMyContractsSummaryServer(): Promise<ContractSummaryResponse> {
    return await serverFetch<ContractSummaryResponse>(`/contracts/my/summary`);
}
