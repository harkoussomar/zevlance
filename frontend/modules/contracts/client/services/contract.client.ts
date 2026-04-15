import api from "@/modules/shared/lib/axios";
import type { ContractResponse } from "../../shared/types/contract.shared";

export async function completeContract(id: string, signal?: AbortSignal): Promise<ContractResponse> {
  const { data } = await api.put<ContractResponse>(`/contracts/${id}/complete`, undefined, { signal });
  return data;
}