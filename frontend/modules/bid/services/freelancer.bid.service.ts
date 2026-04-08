import api from "@/modules/shared/lib/axios";
import type { PaginatedResponse } from "@/modules/shared/types";
import type { BidFilters, BidResponse, CreateBidRequest } from "../types";

/**
 * Submit a new bid on a project.
 * @role    FREELANCER only
 * @method  POST /projects/{projectId}/bids
 * @returns 201 Created — BidResponse with status "PENDING"
 * @throws  409 — already submitted a bid on this project
 * @throws  400 — project is not open for bidding
 */
export function createBid(
  projectId: string,
  payload: CreateBidRequest,
  signal?: AbortSignal,
): Promise<BidResponse> {
  return api
    .post<BidResponse>(`/projects/${projectId}/bids`, payload, { signal })
    .then((res) => res.data);
}

/**
 * Fetch the authenticated freelancer's own bids (paginated).
 * @role    FREELANCER only
 * @method  GET /bids/my
 * @returns 200 OK — PaginatedResponse<BidResponse>
 */
export function getMyBids(
  filters: BidFilters,
  signal?: AbortSignal,
): Promise<PaginatedResponse<BidResponse>> {
  return api
    .get<PaginatedResponse<BidResponse>>("/bids/my", { params: filters, signal })
    .then((res) => res.data);
}

/**
 * Withdraw one of the freelancer's own PENDING bids.
 * @role    FREELANCER (bid owner only)
 * @method  PUT /bids/{id}/withdraw
 * @returns 200 OK — BidResponse with status "WITHDRAWN"
 * @throws  400 — only PENDING bids can be withdrawn
 */
export function withdrawBid(bidId: string, signal?: AbortSignal): Promise<BidResponse> {
  return api
    .put<BidResponse>(`/bids/${bidId}/withdraw`, undefined, { signal })
    .then((res) => res.data);
}