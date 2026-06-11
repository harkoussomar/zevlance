import "server-only";
import { serverFetch } from "@/modules/shared/lib/bff/server-fetch";
import type { StripeConnectResponse } from "../types";

export async function startStripeOnboardingServer(): Promise<StripeConnectResponse> {
    return await serverFetch<StripeConnectResponse>("/stripe/connect/onboard", {
        method: "POST",
    });
}

export async function getStripeConnectStatusServer(): Promise<boolean> {
    return await serverFetch<boolean>("/stripe/connect/status");
}
