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
    if (data !== null && typeof data === "object") {
      const d = data as Record<string, unknown>;
      if (typeof d.message === "string") errorMessage = d.message;
      else if (typeof d.detail === "string") errorMessage = d.detail;
    } else if (typeof data === "string") {
      errorMessage = data;
    }
    super(`serverFetch [${status}] ${path} — ${errorMessage}`);
    this.name = "ServerFetchError";
  }
}

export async function serverFetch<T>(
  path: string,
  options: Omit<RequestInit, "next"> & { next?: RequestInit["next"] } = {},
): Promise<T> {
  const { next, headers, ...restOptions } = options;

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const url = `${BACKEND_BASE}${path.startsWith("/") ? path : `/${path}`}`;

  // Log outgoing internal fetch requests safely
  console.log(`[BFF ⚙️] Internal serverFetch calling: ${url}`);

  const res = await fetch(url, {
    ...restOptions,
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Token": process.env.INTERNAL_API_SECRET || "",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
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
    // Let handleServerError handle the logging
    throw new ServerFetchError(res.status, path, errorPayload);
  }

  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return undefined as unknown as T;
  }

  return res.json() as Promise<T>;
}