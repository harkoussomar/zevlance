import axios from "axios";

export function parseApiError(
    error: unknown,
    statusMessages: Record<number, string> = {},
): string {
    if (axios.isAxiosError(error)) {
        
        // Ignore cancelled requests
        if (axios.isCancel(error)) return "";

        const response = error.response;

        if (response) {
            const { status, data } = response;

            // A. Component-level overrides (Highest Priority)
            if (statusMessages[status]) {
                return statusMessages[status];
            }

            if (data && typeof data === "object" && !Array.isArray(data)) {
                
                // B. Matches your backend: public record ErrorResponse(String message)
                if ("message" in data && typeof data.message === "string") {
                    return data.message;
                }

                // C. Matches your backend: MethodArgumentNotValidException Map<String, String>
                const fieldErrors = Object.entries(data)
                    .filter(([key, val]) => key !== "error" && typeof val === "string")
                    .map(([field, msg]) => `${capitalize(field)}: ${msg}`)
                    .join(", ");
                
                if (fieldErrors) return fieldErrors;
            }

            // D. Fallbacks if the backend didn't send a JSON body
            switch (status) {
                case 400: return "Invalid request. Please check your inputs.";
                case 401: return "Invalid email or password.";
                case 403: return "You do not have permission to do this.";
                case 404: return "The requested resource was not found.";
                case 409: return "A conflict occurred (e.g., email already exists).";
                default:
                    if (status >= 500) return "Server error — please try again later.";
            }
        } 
        
        // E. Network errors / Timeouts
        if (error.code === 'ECONNABORTED') return "Request timed out.";
        if (error.request) return "Cannot connect to server. Please check your internet connection.";
    }

    if (error instanceof Error && error.message.toLowerCase().includes("network")) {
        return "Network error. Please check your connection.";
    }

    return "Something went wrong. Please try again.";
}

function capitalize(str: string): string {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}