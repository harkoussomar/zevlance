export function LoginParseApiError(error: unknown): string {
    if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response
    ) {
        const data = (error.response as { data: Record<string, string> }).data;

        // Single message field
        if (data?.message) return data.message;

        // Validation field errors
        const fieldErrors = Object.entries(data ?? {})
            .filter(([key]) => key !== "error")
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(", ");

        if (fieldErrors) return fieldErrors;

        // HTTP status fallbacks
        const status = (error.response as { status?: number }).status;
        if (status === 401) return "Invalid email or password";
        if (status === 403) return "Access denied";
        if (status === 500) return "Server error — please try again later";
    }

    return "Something went wrong. Please try again.";
}