// ─── lib/axios.ts ─────────────────────────────────────────────────────────────

import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/store/auth-store";

// ─── Shared error shape from Spring Boot ──────────────────────────────────────

export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string>;
}

// ─── Axios instance ───────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: "/api/v1",
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // sends httpOnly JWT cookie automatically
});

// ─── Routes that should NOT trigger a logout on 401 ──────────────────────────
//
// These are endpoints the app intentionally calls without a guaranteed session.
// NOTE: /auth/me is NOT here — it is an authenticated endpoint. A 401 there
// means the session expired and the user must be logged out.

const PUBLIC_EXACT: string[] = [
  "/auth/login",
  "/auth/register/freelancer",
  "/auth/register/client",
  "/auth/forgot-password",
  "/auth/reset-password",
];

const PUBLIC_GET_PREFIXES: string[] = ["/freelancers", "/clients"];
const PROJECT_PUBLIC_REGEX = /^\/projects(\/[0-9a-f-]{36})?$/;

const SILENT_401_PREFIXES: string[] = [
  "/notifications",
];

function isPublicRequest(error: AxiosError): boolean {
  const url    = error.config?.url ?? "";
  const method = (error.config?.method ?? "").toLowerCase();
  if (PUBLIC_EXACT.includes(url)) return true;
  if (method === "get" && PUBLIC_GET_PREFIXES.some((p) => url.startsWith(p))) return true;
  if (method === "get" && PROJECT_PUBLIC_REGEX.test(url)) return true;
  if (SILENT_401_PREFIXES.some((p) => url.startsWith(p))) return true; // ← new
  return false;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const status = error.response?.status;

    if (status === 401 && !isPublicRequest(error)) {
      if (typeof window !== "undefined") {
        try {
          await api.post("/auth/logout");
        } catch {
        }
        useAuthStore.getState().logout();
        window.location.replace("/login");
      }
    }
    return Promise.reject(error);
  },
);

export default api;
