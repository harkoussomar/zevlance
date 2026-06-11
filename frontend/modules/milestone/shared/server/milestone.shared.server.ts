import "server-only";
import { serverFetch } from "@/modules/shared/lib/bff/server-fetch";
import type { MilestoneResponse } from "../types/milestone.shared";
import type { CheckoutSessionResponse } from "@/modules/payment/types";

export async function fundMilestoneServer(
    id: string,
): Promise<CheckoutSessionResponse> {
    return await serverFetch<CheckoutSessionResponse>(
        `/milestones/${id}/fund`,
        { method: "POST" },
    );
}

export async function refundMilestoneServer(id: string): Promise<void> {
    await serverFetch(`/milestones/${id}/refund`, { method: "POST" });
}

export async function submitMilestoneServer(
    id: string,
    body: unknown,
): Promise<MilestoneResponse> {
    return await serverFetch<MilestoneResponse>(`/milestones/${id}/submit`, {
        method: "PUT",
        body: JSON.stringify(body),
    });
}

export async function requestRevisionServer(
    id: string,
): Promise<MilestoneResponse> {
    return await serverFetch<MilestoneResponse>(`/milestones/${id}/revision`, {
        method: "PUT",
    });
}

export async function approveMilestoneServer(
    id: string,
): Promise<MilestoneResponse> {
    return await serverFetch<MilestoneResponse>(`/milestones/${id}/approve`, {
        method: "PUT",
    });
}
