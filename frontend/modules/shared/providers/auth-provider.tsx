"use client";
import { useRef } from "react";
import { useAuthStore } from "@/store/auth-store";
import type { AuthResponse } from "@/modules/auth/types";

// ─── Props ────────────────────────────────────────────────────────────────────
interface AuthProviderProps {
  children: React.ReactNode;
  initialUser: AuthResponse | null;
}

// ─── AuthProvider ─────────────────────────────────────────────────────────────
export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const loginRef = useRef(useAuthStore.getState().login);

  if (initialUser) {
    loginRef.current(initialUser);
  }

  return <>{children}</>;
}