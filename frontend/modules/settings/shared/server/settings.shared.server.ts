import "server-only";
import { serverFetch } from "@/modules/shared/lib/bff/server-fetch";
import type { UpdatePasswordRequest } from "../types/settings.shared";

export async function changePasswordServer(
    payload: UpdatePasswordRequest,
): Promise<void> {
    await serverFetch("/users/me/password", {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
}
