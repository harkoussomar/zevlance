import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateClientProfileRequest } from "../types/settings.client";
import { updateClientProfile } from "../services/settings.client";
import { profileKeys } from "@/modules/profile/shared";
import { toast } from "sonner";

/**
 * Mutates the client profile and updates the cached query in place so the
 * profile page reflects changes immediately without a refetch round-trip.
 */
export function useUpdateClientProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateClientProfileRequest) =>
      updateClientProfile(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(profileKeys.myClient(), updated);
    },
    onError: (error: Error) => {
      const message =
        error.message ?? "Failed to update profile. Please try again.";
      toast.error(message);
    },
  });
}