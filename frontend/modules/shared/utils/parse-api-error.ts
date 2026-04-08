/**
 * parseApiError
 *
 * Single reusable error extractor for all auth flows (and beyond).
 *
 * The only thing that differs between login and register is which HTTP status
 * codes carry domain-specific meaning. Pass a `statusMessages` map to
 * override those per call-site — everything else (response shape, field
 * errors, fallback) is shared.
 *
 * Usage:
 *   // Login
 *   parseApiError(err, {
 *     401: "Invalid email or password",
 *     403: "Access denied",
 *   });
 *
 *   // Register
 *   parseApiError(err, {
 *     409: "An account with this email already exists",
 *     400: "Please check your details and try again",
 *   });
 *
 *   // Generic (no overrides needed)
 *   parseApiError(err);
 */
export function parseApiError(
  error: unknown,
  statusMessages: Record<number, string> = {},
): string {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response
  ) {
    const response = error.response as {
      data: Record<string, string>;
      status?: number;
    };
    const data = response.data;

    // 1. Single message field from Spring (most common)
    if (data?.message) return data.message;

    // 2. Spring Validation field errors — { fieldName: "message", ... }
    const fieldErrors = Object.entries(data ?? {})
      .filter(([key]) => key !== "error")
      .map(([field, msg]) => `${field}: ${msg}`)
      .join(", ");
    if (fieldErrors) return fieldErrors;

    // 3. Status-code messages — caller-supplied overrides first, then shared defaults
    const status = response.status;
    if (status !== undefined) {
      if (statusMessages[status]) return statusMessages[status];
      if (status === 500) return "Server error — please try again later";
    }
  }

  return "Something went wrong. Please try again.";
}