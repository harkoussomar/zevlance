// ─── features/settings/services/settings.service.ts ──────────────────────────

import { ClientProfileResponse, FreelancerProfileResponse } from "@/modules/profile";
import type {
  UpdateClientProfileRequest,
  UpdateFreelancerProfileRequest,
  UpdatePasswordRequest,
} from "../types";
import api from "@/modules/shared/lib/axios";


// ─── Profile updates ──────────────────────────────────────────────────────────

/**
 * PATCH /users/me/client-profile
 * Partial update — only non-null fields are applied on the server.
 *
 * @role CLIENT
 */
export async function updateClientProfile(
  data: UpdateClientProfileRequest,
): Promise<ClientProfileResponse> {
  const { data: res } = await api.patch<ClientProfileResponse>(
    "/users/me/client-profile",
    data,
  );
  return res;
}

/**
 * PATCH /users/me/freelancer-profile
 * Partial update — only non-null fields are applied on the server.
 *
 * @role FREELANCER
 */
export async function updateFreelancerProfile(
  data: UpdateFreelancerProfileRequest,
): Promise<FreelancerProfileResponse> {
  const { data: res } = await api.patch<FreelancerProfileResponse>(
    "/users/me/freelancer-profile",
    data,
  );
  return res;
}

// ─── Password ─────────────────────────────────────────────────────────────────

/**
 * PATCH /users/me/password
 * Returns 204 No Content on success.
 * Throws 400 if currentPassword is wrong or newPassword === currentPassword.
 *
 * @role CLIENT | FREELANCER
 */
export async function changePassword(
  data: UpdatePasswordRequest,
): Promise<void> {
  await api.patch("/users/me/password", data);
}