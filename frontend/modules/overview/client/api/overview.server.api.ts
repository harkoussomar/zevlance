import "server-only";
import { serverFetch } from "@/modules/shared/lib/bff/server-fetch";
import type { ClientOverviewResponse } from "../types/overview.client";

export async function getClientOverview(): Promise<ClientOverviewResponse> {
    return await serverFetch<ClientOverviewResponse>("/dashboard/client", {
        next: { revalidate: 60, tags: ["dashboard", "client"] },
    });
}
