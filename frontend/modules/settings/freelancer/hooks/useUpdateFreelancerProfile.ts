import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateFreelancerProfileRequest } from "../types/settings.freelancer";
import { updateFreelancerProfile } from "../api/settings.freelancer.api";
import { profileKeys } from "@/modules/profile/shared";
import { toast } from "sonner";

export function useUpdateFreelancerProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateFreelancerProfileRequest) =>
      updateFreelancerProfile(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(profileKeys.myFreelancer(), updated);
      queryClient.invalidateQueries({
        queryKey: profileKeys.freelancer(updated.id),
      });
    },
    onError: (error: Error) => {
      const message =
        error.message ?? "Failed to update profile. Please try again.";
      toast.error(message);
    },
  });
}