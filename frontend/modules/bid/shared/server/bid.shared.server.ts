import "server-only";
import { serverFetch } from "@/modules/shared/lib/bff/server-fetch";
import type { PaginatedResponse } from "@/modules/shared/types";
import type {
    BidResponse,
    BidFilters,
    BidSummaryResponse,
} from "../types/bid.shared";
import type { ContractResponse } from "@/modules/contracts/shared/types/contract.shared";

export async function getProjectBidsServer(
    projectId: string,
    filters: Partial<BidFilters> = {},
): Promise<PaginatedResponse<BidResponse>> {
    const qs = new URLSearchParams();
    if (filters.page !== undefined) qs.set("page", String(filters.page));
    if (filters.size !== undefined) qs.set("size", String(filters.size));
    if (filters.status) qs.set("status", String(filters.status));
    return await serverFetch<PaginatedResponse<BidResponse>>(
        `/projects/${projectId}/bids${qs.toString() ? `?${qs.toString()}` : ""}`,
    );
}

export async function createProjectBidServer(
    projectId: string,
    body: unknown,
): Promise<BidResponse> {
    return await serverFetch<BidResponse>(`/projects/${projectId}/bids`, {
        method: "POST",
        body: JSON.stringify(body),
    });
}

export async function getMyBidsServer(
    qs?: string,
): Promise<PaginatedResponse<BidResponse>> {
    return await serverFetch<PaginatedResponse<BidResponse>>(
        `/bids/my${qs ? `?${qs}` : ""}`,
    );
}

export async function getMyBidsSummaryServer(): Promise<BidSummaryResponse> {
    return await serverFetch<BidSummaryResponse>("/bids/my/summary");
}

export async function acceptBidServer(id: string): Promise<ContractResponse> {
    return await serverFetch<ContractResponse>(`/bids/${id}/accept`, {
        method: "PUT",
    });
}

export async function rejectBidServer(id: string): Promise<BidResponse> {
    return await serverFetch<BidResponse>(`/bids/${id}/reject`, {
        method: "PUT",
    });
}

export async function withdrawBidServer(id: string): Promise<BidResponse> {
    return await serverFetch<BidResponse>(`/bids/${id}/withdraw`, {
        method: "PUT",
    });
}
