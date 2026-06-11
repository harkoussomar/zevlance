"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import type { AuthResponse } from "@/modules/auth/types";

// ─── Props ────────────────────────────────────────────────────────────────────
interface AuthProviderProps {
  children: React.ReactNode;
  initialUser: AuthResponse | null;
}

// ─── AuthProvider ─────────────────────────────────────────────────────────────
export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  useEffect(() => {
    if (initialUser) {
      useAuthStore.getState().login(initialUser);
    }
  }, [initialUser]);

  return <>{children}</>;
}
