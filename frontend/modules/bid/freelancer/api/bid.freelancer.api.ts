import api from "@/modules/shared/lib/axios";
import type { PaginatedResponse } from "@/modules/shared/types";
import type { BidFilters, BidResponse, BidSummaryResponse } from "../../shared/types/bid.shared";
import { CreateBidRequest } from "../types/bid.freelancer";


// ── queries ───────────────────────────────────────────────────────────────────
 
/**
 * Fetches a paginated, optionally status-filtered list of the current
 * freelancer's bids. Pass `status: undefined` (or omit it) for all statuses.
 */
export async function getMyBids(
    filters: BidFilters,
    signal?: AbortSignal,
): Promise<PaginatedResponse<BidResponse>> {
  
    const { data } = await api.get<PaginatedResponse<BidResponse>>("/bids/my", {
        params: filters,
        signal,
    });
    return data;
}
 
/**
 * Fetches aggregate counts and financial metrics independently of pagination.
 * This is the authoritative source for stat cards and insight numbers —
 * never derive those from the paginated list.
 */
export async function getMyBidsSummary(
    signal?: AbortSignal,
): Promise<BidSummaryResponse> {
    const { data } = await api.get<BidSummaryResponse>("/bids/my/summary", { signal });
    return data;
}


export async function createBid(
    projectId: string,
    payload: CreateBidRequest,
    signal?: AbortSignal,
): Promise<BidResponse> {
    const { data } = await api.post<BidResponse>(
        `/projects/${projectId}/bids`,
        payload,
        { signal },
    );
    return data;
}

export async function withdrawBid(
    bidId: string,
    signal?: AbortSignal,
): Promise<BidResponse> {
    const { data } = await api.put<BidResponse>(
        `/bids/${bidId}/withdraw`,
        undefined,
        { signal },
    );
    return data;
}
