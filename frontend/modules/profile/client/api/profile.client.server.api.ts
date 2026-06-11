import "server-only";
import { serverFetch } from "@/modules/shared/lib/bff/server-fetch";
import type { ClientProfileResponse } from "../types/profile.client";

export async function getMyClientProfileServer(): Promise<ClientProfileResponse> {
    return await serverFetch<ClientProfileResponse>("/users/me/client-profile");
}
