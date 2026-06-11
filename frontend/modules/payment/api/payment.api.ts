import api from "@/modules/shared/lib/axios";
import type { CheckoutSessionResponse, StripeConnectResponse } from "../types";

export async function fundMilestone(
    milestoneId: string,
    signal?: AbortSignal,
): Promise<CheckoutSessionResponse> {
    const { data } = await api.post<CheckoutSessionResponse>(
        `/milestones/${milestoneId}/fund`,
        undefined,
        { signal },
    );
    return data;
}

export async function refundMilestone(
    milestoneId: string,
    signal?: AbortSignal,
): Promise<void> {
    await api.post(`/milestones/${milestoneId}/refund`, undefined, { signal });
}

export async function startStripeOnboarding(
    signal?: AbortSignal,
): Promise<StripeConnectResponse> {
    const { data } = await api.post<StripeConnectResponse>(
        "/stripe/connect/onboard",
        undefined,
        { signal },
    );
    return data;
}

export async function getStripeConnectStatus(
    signal?: AbortSignal,
): Promise<boolean> {
    const { data } = await api.get<boolean>(
        "/stripe/connect/status",
        { signal },
    );
    return data;
}
