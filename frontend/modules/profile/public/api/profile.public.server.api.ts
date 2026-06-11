import "server-only";
import { serverFetch } from "@/modules/shared/lib/bff/server-fetch";
import { FreelancerProfileResponse } from "../../freelancer";

export async function getFreelancerProfileServer(
    id: string,
): Promise<FreelancerProfileResponse> {
    return await serverFetch<FreelancerProfileResponse>(`/freelancers/${id}`, {
        next: { revalidate: 300, tags: ["profile", `freelancer-${id}`] },
    });
}
