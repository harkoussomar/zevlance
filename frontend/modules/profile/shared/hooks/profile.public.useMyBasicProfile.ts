import { selectIsAuthenticated, useAuthStore } from "@/store/auth-store";
import { useQuery } from "@tanstack/react-query";
import { getMyBasicProfile } from "../services/profile.shared.service";
import { profileKeys } from "./profile.keys";

/**
 * Fetches minimal profile data for the authenticated user (any role).
 * GET /users/me/basic
 * Intended for shared UI — sidebar, topbar, avatars.
 * Stale after 5 minutes — this data rarely changes mid-session.
 */
export function useMyBasicProfile() {
    const isAuthenticated = useAuthStore(selectIsAuthenticated);

    return useQuery({
        queryKey: profileKeys.myBasic(),
        queryFn: getMyBasicProfile,
        enabled: isAuthenticated,
    });
}
