import { useMutation } from "@tanstack/react-query";
import { UpdatePasswordRequest } from "../types/settings.shared";
import { changePassword } from "../api/settings.shared.api";

/**
 * No cache to update — the password is never stored in the query cache.
 * Error handling (wrong current password) surfaces via `mutation.error`.
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: UpdatePasswordRequest) =>
      changePassword(data),
  });
}