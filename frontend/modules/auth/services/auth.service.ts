import api from "@/modules/shared/lib/axios";
import type {
  AuthResponse,
  LoginRequest,
  RegisterClientRequest,
  RegisterFreelancerRequest,
} from "../types";

export const authService = {
  login: (data: LoginRequest, signal?: AbortSignal): Promise<AuthResponse> =>
    api
      .post<AuthResponse>("/auth/login", data, { signal })
      .then((res) => res.data),

  registerFreelancer: (
    data: RegisterFreelancerRequest,
    signal?: AbortSignal,
  ): Promise<AuthResponse> =>
    api
      .post<AuthResponse>("/auth/register/freelancer", data, { signal })
      .then((res) => res.data),

  registerClient: (
    data: RegisterClientRequest,
    signal?: AbortSignal,
  ): Promise<AuthResponse> =>
    api
      .post<AuthResponse>("/auth/register/client", data, { signal })
      .then((res) => res.data),

  logout: (signal?: AbortSignal): Promise<void> =>
    api
      .post<void>("/auth/logout", undefined, { signal })
      .then(() => undefined),

  /**
   * forgotPassword
   *
   * Sends a password-reset link to the provided email.
   * The backend never reveals whether the email exists — always returns 200.
   */
  forgotPassword: (email: string, signal?: AbortSignal): Promise<void> =>
    api
      .post<void>("/auth/forgot-password", { email }, { signal })
      .then(() => undefined),

  /**
   * resetPassword
   *
   * Submits the new password along with the one-time token from the email link.
   * Throws AxiosError on expired / invalid token (4xx).
   */
  resetPassword: (
    token: string,
    newPassword: string,
    signal?: AbortSignal,
  ): Promise<void> =>
    api
      .post<void>("/auth/reset-password", { token, newPassword }, { signal })
      .then(() => undefined),
} as const;