import api from "@/modules/shared/lib/axios";
import type { ClientProfileResponse } from "../types/profile.client";




/**
 * GET /users/me/client-profile
 * Returns the full profile of the authenticated client.
 *
 * @role   CLIENT
 * @throws 403 — if the authenticated user is not a CLIENT
 */
export async function getMyClientProfile(signal?: AbortSignal): Promise<ClientProfileResponse> {
  const { data } = await api.get<ClientProfileResponse>(
    "/users/me/client-profile",
    { signal },
  );
  return data;
}