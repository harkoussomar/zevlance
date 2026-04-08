import "server-only";

// ─── modules/shared/lib/server-fetch.ts ───────────────────────────────────────
//
// Server-only fetch utility for RSC data fetching.
// Forwards the httpOnly JWT cookie to the Spring Boot backend directly
// (bypasses Next.js rewrites — those only apply to browser/edge requests).
//
// Usage:
//   const profile = await serverFetch<FreelancerProfileResponse>("/users/me/freelancer-profile");

import { cookies } from "next/headers";

const BACKEND_BASE =
    process.env.BACKEND_INTERNAL_URL ?? "http://localhost:8080/api/v1";

export class ServerFetchError extends Error {
    constructor(
        public readonly status: number,
        public readonly path: string,
    ) {
        super(`serverFetch ${path} → ${status}`);
    }
}

interface ServerFetchOptions {
    /**
     * next.js revalidation in seconds.
     * Omit (or pass 0) for request-level cache (no-store behaviour).
     * Pass a positive number for ISR-style revalidation.
     */
    revalidate?: number;
}

export async function serverFetch<T>(
    path: string,
    { revalidate = 0 }: ServerFetchOptions = {},
): Promise<T> {
    const cookieStore = await cookies();

    // Reconstruct the Cookie header so the httpOnly JWT is forwarded.
    const cookieHeader = cookieStore
        .getAll()
        .map((c) => `${c.name}=${c.value}`)
        .join("; ");

    const res = await fetch(`${BACKEND_BASE}${path}`, {
        headers: {
            "Content-Type": "application/json",
            ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        },
        next: { revalidate },
    });

    if (!res.ok) throw new ServerFetchError(res.status, path);

    return res.json() as Promise<T>;
}