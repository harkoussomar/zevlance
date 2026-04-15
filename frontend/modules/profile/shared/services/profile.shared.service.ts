import api from "@/modules/shared/lib/axios";
import type { BasicProfileResponse } from "..";

/**
 * GET /users/me
 * Returns minimal profile data for the authenticated user, regardless of role.
 * Use this for shared UI (sidebar, topbar) — avoids role-branching on the client.
 *
 * @throws 401 — if not authenticated
 */
export async function getMyBasicProfile(): Promise<BasicProfileResponse> {
    const { data } = await api.get<BasicProfileResponse>("/users/me");
    return data;
}
