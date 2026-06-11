import { FreelancerProfileResponse } from "@/modules/profile/freelancer";
import { UpdateFreelancerProfileRequest } from "../types/settings.freelancer";
import api from "@/modules/shared/lib/axios";


export async function updateFreelancerProfile(
  payload: UpdateFreelancerProfileRequest,
  signal?: AbortSignal,
): Promise<FreelancerProfileResponse> {
  const { data } = await api.patch<FreelancerProfileResponse>(
    "/users/me/freelancer-profile",
    payload,
    { signal },
  );
  return data;
}
