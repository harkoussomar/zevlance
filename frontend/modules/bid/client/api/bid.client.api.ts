import api from "@/modules/shared/lib/axios";
import type { PaginatedResponse } from "@/modules/shared/types";
import type { BidFilters, BidResponse } from "../../shared/types/bid.shared";
import type { ContractResponse } from "@/modules/contracts/shared";

export async function getProjectBids(
  projectId: string,
  filters: BidFilters,
  signal?: AbortSignal,
): Promise<PaginatedResponse<BidResponse>> {
  const { data } = await api.get<PaginatedResponse<BidResponse>>(
    `/projects/${projectId}/bids`,
    { params: filters, signal },
  );
  return data;
}

export async function acceptBid(id: string, signal?: AbortSignal): Promise<ContractResponse> {
  const { data } = await api.put<ContractResponse>(`/bids/${id}/accept`, undefined, { signal });
  return data;
}

export async function rejectBid(id: string, signal?: AbortSignal): Promise<BidResponse> {
  const { data } = await api.put<BidResponse>(`/bids/${id}/reject`, undefined, { signal });
  return data;
}