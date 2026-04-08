// ─── store/auth-store.ts ──────────────────────────────────────────────────────

import { AuthResponse } from "@/modules/auth/types";
import { create } from "zustand";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthState extends AuthResponse {
  isAuthenticated: boolean;
}

interface AuthActions {
  login:  (user: AuthResponse) => void;
  logout: () => void;
}

const INITIAL_STATE: AuthState = {
  userId:          "",
  email:           "",
  role:            "CLIENT",
  name:            "",
  isAuthenticated: false,
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState & AuthActions>()((set) => ({
  ...INITIAL_STATE,

  login: (user) =>
    set({
      ...user,
      isAuthenticated: true,
    }),

  logout: () => {
    // Clear the JS-readable session flag cookie. The httpOnly JWT is cleared
    // server-side by POST /auth/logout (called by the axios interceptor or
    // the logout handler before this action is dispatched).
    if (typeof document !== "undefined") {
      document.cookie = "has_session=; path=/; max-age=0";
      document.cookie = "user_role=; path=/; max-age=0";
    }
    set(INITIAL_STATE);
  },
}));

// ─── Selectors ────────────────────────────────────────────────────────────────
//
// Use these in components instead of inline arrow functions to avoid
// unnecessary re-renders from reference inequality.

export const selectIsAuthenticated = (s: AuthState & AuthActions) =>
  s.isAuthenticated;
export const selectRole   = (s: AuthState & AuthActions) => s.role;
export const selectUserId = (s: AuthState & AuthActions) => s.userId;
export const selectName   = (s: AuthState & AuthActions) => s.name;