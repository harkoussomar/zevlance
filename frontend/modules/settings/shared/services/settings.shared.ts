import api from "@/modules/shared/lib/axios";
import { UpdatePasswordRequest } from "../types/settings.shared";


export async function changePassword(
  payload: UpdatePasswordRequest,
  signal?: AbortSignal,
): Promise<void> {
  await api.patch("/users/me/password", payload, { signal });
}