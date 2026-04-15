import api from "@/modules/shared/lib/axios";
import type { FreelancerProfileResponse } from "../types/profile.freelancer";

/**
 * GET /users/me/freelancer-profile
 * Returns the full profile of the authenticated freelancer.
 *
 * @role   FREELANCER
 * @throws 403 — if the authenticated user is not a FREELANCER
 */
export async function getMyFreelancerProfile(signal?: AbortSignal): Promise<FreelancerProfileResponse> {
  const { data } = await api.get<FreelancerProfileResponse>(
    "/users/me/freelancer-profile",
    { signal }, // ✅ was missing
  );
  return data;
}