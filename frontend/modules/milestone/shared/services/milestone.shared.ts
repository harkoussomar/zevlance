import api from "@/modules/shared/lib/axios";
import type { MilestoneResponse } from "../types/milestone.shared";

export async function getContractMilestones(
  contractId: string,
  signal?: AbortSignal,
): Promise<MilestoneResponse[]> {
  const { data } = await api.get<MilestoneResponse[]>(
    `/contracts/${contractId}/milestones`,
    { signal },
  );
  return data;
}