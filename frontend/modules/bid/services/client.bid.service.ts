import api from "@/modules/shared/lib/axios";
import type { PaginatedResponse } from "@/modules/shared/types";
import type { BidFilters, BidResponse } from "../types";
import type { ContractResponse } from "@/modules/contracts/types";

/**
 * Fetch all bids on a specific project.
 * @role   CLIENT (project owner only)
 * @method GET /projects/{projectId}/bids
 * @returns 200 OK — paginated
 */
export function getProjectBids(
  projectId: string,
  filters: BidFilters,
  signal?: AbortSignal,
): Promise<PaginatedResponse<BidResponse>> {
  return api
    .get<PaginatedResponse<BidResponse>>(`/projects/${projectId}/bids`, {
      params: filters,
      signal,
    })
    .then((res) => res.data);
}

/**
 * Accept a bid — creates a Contract automatically.
 * @role   CLIENT (project owner only)
 * @method PUT /bids/{id}/accept
 * @returns 200 OK — ContractResponse
 */
export function acceptBid(id: string, signal?: AbortSignal): Promise<ContractResponse> {
  return api
    .put<ContractResponse>(`/bids/${id}/accept`, undefined, { signal })
    .then((res) => res.data);
}

/**
 * Reject a bid.
 * @role   CLIENT (project owner only)
 * @method PUT /bids/{id}/reject
 * @returns 200 OK — BidResponse with status "REJECTED"
 */
export function rejectBid(id: string, signal?: AbortSignal): Promise<BidResponse> {
  return api
    .put<BidResponse>(`/bids/${id}/reject`, undefined, { signal })
    .then((res) => res.data);
}