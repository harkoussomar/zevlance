import api from "@/modules/shared/lib/axios";
import type { CreateMilestoneRequest } from "../types/milestone.client";
import type { MilestoneResponse } from "../../shared";


export async function createMilestone(
  contractId: string,
  payload: CreateMilestoneRequest,
  signal?: AbortSignal,
): Promise<MilestoneResponse> {
  const { data } = await api.post<MilestoneResponse>(
    `/contracts/${contractId}/milestones`,
    payload,
    { signal },
  );
  return data;
}

export async function approveMilestone(
  milestoneId: string,
  signal?: AbortSignal,
): Promise<MilestoneResponse> {
  const { data } = await api.put<MilestoneResponse>(
    `/milestones/${milestoneId}/approve`,
    undefined,
    { signal },
  );
  return data;
}

export async function requestRevision(
  milestoneId: string,
  signal?: AbortSignal,
): Promise<MilestoneResponse> {
  const { data } = await api.put<MilestoneResponse>(
    `/milestones/${milestoneId}/revision`,
    undefined,
    { signal },
  );
  return data;
}