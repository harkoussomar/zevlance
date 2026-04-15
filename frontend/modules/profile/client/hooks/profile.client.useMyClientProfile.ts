import { useAuthStore } from "@/store/auth-store";
import { useQuery } from "@tanstack/react-query";
import { profileKeys } from "../../shared";
import { getMyClientProfile } from "../services/profile.client.service";

export function useMyClientProfile() {
  const { role } = useAuthStore();

  return useQuery({
    queryKey: profileKeys.myClient(),
    queryFn:  ({ signal }) => getMyClientProfile(signal),
    enabled:  role === "CLIENT",
  });
}