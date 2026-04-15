import "server-only";
import { cookies } from "next/headers";

const BACKEND_BASE = (
    process.env.BACKEND_INTERNAL_URL ?? "http://localhost:8080/api/v1"
).replace(/\/$/, "");

export class ServerFetchError extends Error {
    constructor(
        public readonly status: number,
        public readonly path: string,
        public readonly data?: unknown,
    ) {
        let errorMessage = "Unknown Error";

        // Safely extract the message depending on what the backend returned
        if (data !== null && typeof data === "object") {
            const d = data as Record<string, unknown>;
            if (typeof d.message === "string") {
                errorMessage = d.message;
            } else if (typeof d.detail === "string") { // Spring Boot ProblemDetail
                errorMessage = d.detail;
            }
        } else if (typeof data === "string") {
            errorMessage = data;
        }

        super(`serverFetch [${status}] ${path} — ${errorMessage}`);
        this.name = "ServerFetchError";
    }
}

interface ServerFetchOptions extends Omit<RequestInit, "next"> {
    next?: RequestInit["next"];
}

export async function serverFetch<T>(
    path: string,
    options: ServerFetchOptions = {},
): Promise<T> {
    const { next, headers, ...restOptions } = options;

    const cookieStore = await cookies();

    // 1. Reconstruct the full Cookie string
    const cookieHeader = cookieStore
        .getAll()
        .map((c) => `${c.name}=${c.value}`)
        .join("; ");

    // 2. Extract XSRF token
    const xsrfToken = cookieStore.get("XSRF-TOKEN")?.value;

    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const url = `${BACKEND_BASE}${cleanPath}`;

    const res = await fetch(url, {
        ...restOptions,
        headers: {
            "Content-Type": "application/json",
            ...(cookieHeader ? { Cookie: cookieHeader } : {}),
            ...(xsrfToken ? { "X-XSRF-TOKEN": xsrfToken } : {}),
            ...headers,
        },
        next,
    });

    if (!res.ok) {
        let errorPayload: unknown;
        try {
            errorPayload = await res.json();
        } catch {
            errorPayload = await res.text();
        }
        throw new ServerFetchError(res.status, path, errorPayload);
    }

    if (res.status === 204 || res.headers.get("content-length") === "0") {
        return undefined as unknown as T;
    }

    return res.json() as Promise<T>;
}