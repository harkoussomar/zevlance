"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { authService } from "../services/auth.service";

interface UseLogoutReturn {
  handleLogout: () => Promise<void>;
  isLoading: boolean;
  logoutError: string | null;
}

/**
 * useLogout
 *
 * Issues fixed vs. original:
 * 1. `"use client"` directive was missing — this hook uses browser APIs and
 *    Next.js client-side router; omitting the directive causes a hard runtime
 *    error in the App Router.
 * 2. No loading state — the original silently fires the API call with no UX
 *    feedback. The button can now be disabled while the request is in flight.
 * 3. No error handling — if the Spring /auth/logout call fails (network error,
 *    500, etc.) the original crashes silently. New behaviour: always clear
 *    local auth state (so the user is never stuck logged-in), but surface any
 *    API error to the caller so the UI can show a toast / banner.
 * 4. `window.location.href` replaced with `router.push` for a client-side
 *    navigation that stays within the Next.js router context. If you need a
 *    full hard reload to bust server-side session cookies, keep
 *    `window.location.href` — but document the intent explicitly.
 * 5. `handleLogout` is wrapped in `useCallback` for a stable reference.
 */
export function useLogout(): UseLogoutReturn {
  const router = useRouter();
  const storeLogout = useAuthStore((s) => s.logout);

  const [isLoading, setIsLoading] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const handleLogout = useCallback(async () => {
    setIsLoading(true);
    setLogoutError(null);

    try {
      await authService.logout();
    } catch {
      // Surface the error but do NOT block local logout — a user should never
      // be unable to log out just because the API is temporarily unreachable.
      setLogoutError("Could not reach the server. You have been logged out locally.");
    } finally {
      // Always clear local state, regardless of API outcome
      storeLogout();
      setIsLoading(false);

      // Use router.push for SPA navigation. Replace with window.location.href
      // if your Spring session requires a full-page reload to clear cookies.
      router.push("/login");
    }
  }, [router, storeLogout]);

  return { handleLogout, isLoading, logoutError };
}