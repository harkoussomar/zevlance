import "server-only";
import { serverFetch } from "@/modules/shared/lib/bff/server-fetch";
import type { BasicProfileResponse } from "../types/profile.shared";

export async function getMyBasicProfileServer(): Promise<BasicProfileResponse> {
    return await serverFetch<BasicProfileResponse>("/users/me");
}
