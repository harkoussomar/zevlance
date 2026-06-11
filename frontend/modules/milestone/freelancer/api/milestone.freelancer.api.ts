import api from "@/modules/shared/lib/axios";
import type {  SubmitDeliverableRequest } from "../types/milestone.freelancer";
import type { MilestoneResponse } from "../../shared";

export async function submitDeliverable(
  milestoneId: string,
  payload: SubmitDeliverableRequest,
  signal?: AbortSignal,
): Promise<MilestoneResponse> {
  const { data } = await api.put<MilestoneResponse>(
    `/milestones/${milestoneId}/submit`,
    payload,
    { signal },
  );
  return data;
}