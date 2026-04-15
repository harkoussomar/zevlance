import type { ClientProfileResponse } from "@/modules/profile/client";
import type { UpdateClientProfileRequest } from "../types/settings.client";
import api from "@/modules/shared/lib/axios";



export async function updateClientProfile(
  payload: UpdateClientProfileRequest,
  signal?: AbortSignal,
): Promise<ClientProfileResponse> {
  const { data } = await api.patch<ClientProfileResponse>(
    "/users/me/client-profile",
    payload,
    { signal },
  );
  return data;
}