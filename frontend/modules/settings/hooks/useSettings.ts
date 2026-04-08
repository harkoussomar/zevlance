// ─── features/settings/hooks/useSettings.ts ───────────────────────────────────

import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as settingsApi from "../services/settings.service";
import type {
  UpdateClientProfileRequest,
  UpdateFreelancerProfileRequest,
  UpdatePasswordRequest,
} from "../types";
import { profileKeys } from "@/modules/profile/hooks/useProfile";

// ─── Update client profile ────────────────────────────────────────────────────

/**
 * Mutates the client profile and updates the cached query in place so the
 * profile page reflects changes immediately without a refetch round-trip.
 */
export function useUpdateClientProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateClientProfileRequest) =>
      settingsApi.updateClientProfile(data),
    onSuccess: (updated) => {
      // Replace the cached profile with the fresh server response
      queryClient.setQueryData(profileKeys.myClient(), updated);
    },
  });
}

// ─── Update freelancer profile ────────────────────────────────────────────────

/**
 * Mutates the freelancer profile and updates the cached query in place.
 * Also invalidates the public freelancer cache so visitors see updated data.
 */
export function useUpdateFreelancerProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateFreelancerProfileRequest) =>
      settingsApi.updateFreelancerProfile(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(profileKeys.myFreelancer(), updated);
      // Invalidate the public view — it may be cached in the same session
      queryClient.invalidateQueries({
        queryKey: profileKeys.freelancer(updated.id),
      });
    },
  });
}

// ─── Change password ──────────────────────────────────────────────────────────

/**
 * No cache to update — the password is never stored in the query cache.
 * Error handling (wrong current password) surfaces via `mutation.error`.
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: UpdatePasswordRequest) =>
      settingsApi.changePassword(data),
  });
}