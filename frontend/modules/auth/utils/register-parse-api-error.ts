export function RegisterParseApiError(error: unknown): string {
    if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response
    ) {
        const data = (error.response as { data: Record<string, string> }).data;

        if (data?.message) return data.message;

        const fieldErrors = Object.entries(data ?? {})
            .filter(([key]) => key !== "error")
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(", ");

        if (fieldErrors) return fieldErrors;

        const status = (error.response as { status?: number }).status;
        if (status === 409) return "An account with this email already exists";
        if (status === 400) return "Please check your details and try again";
        if (status === 500) return "Server error — please try again later";
    }

    return "Something went wrong. Please try again.";
}