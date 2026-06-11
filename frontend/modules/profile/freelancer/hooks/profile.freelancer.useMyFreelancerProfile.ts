import { useAuthStore } from "@/store/auth-store";
import { useQuery } from "@tanstack/react-query";
import { profileKeys } from "../../shared";
import { getMyFreelancerProfile } from "../api/profile.freelancer.api";

/**
 * Fetches the authenticated client's full profile.
 * GET /users/me/client-profile
 */
export function useMyFreelancerProfile() {
    const { role } = useAuthStore();
    return useQuery({
        queryKey: profileKeys.myFreelancer(),
        queryFn: ({ signal }) => getMyFreelancerProfile(signal),
        enabled: role === "FREELANCER",
    });
}
