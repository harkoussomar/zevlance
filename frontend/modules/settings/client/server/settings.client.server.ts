import "server-only";
import { serverFetch } from "@/modules/shared/lib/bff/server-fetch";
import type { ClientProfileResponse } from "@/modules/profile/client";
import type { UpdateClientProfileRequest } from "../types/settings.client";

export async function updateClientProfileServer(
    payload: UpdateClientProfileRequest,
): Promise<ClientProfileResponse> {
    return await serverFetch<ClientProfileResponse>(
        "/users/me/client-profile",
        {
            method: "PATCH",
            body: JSON.stringify(payload),
        },
    );
}
