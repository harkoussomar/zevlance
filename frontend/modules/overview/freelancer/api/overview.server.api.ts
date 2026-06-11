import "server-only";
import { serverFetch } from "@/modules/shared/lib/bff/server-fetch";
import type { FreelancerOverviewResponse } from "../types/overview.freelancer";

export async function getFreelancerOverview(): Promise<FreelancerOverviewResponse> {
    return await serverFetch<FreelancerOverviewResponse>(
        "/dashboard/freelancer",
        {
            next: { revalidate: 60, tags: ["dashboard", "freelancer"] }, // Next 15/16 caching best practices
        },
    );
}
