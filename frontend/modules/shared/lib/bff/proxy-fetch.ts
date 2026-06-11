import "server-only";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_BASE = (
  process.env.BACKEND_INTERNAL_URL ?? "http://localhost:8080/api/v1"
).replace(/\/$/, "");

export async function proxyToSpring(
  path: string,
  options: {
    method?: string;
    body?: unknown;
  } = {},
): Promise<Response> {
  const url = `${BACKEND_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const method = options.method ?? "POST";

  const bffToken = process.env.INTERNAL_API_SECRET || "";

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Token": bffToken,
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    ...(options.body !== undefined
      ? { body: JSON.stringify(options.body) }
      : {}),
  });

  let data: unknown = null;
  const contentType = res.headers.get("content-type") ?? "";
  const contentLength = res.headers.get("content-length");

  if (
    res.status !== 204 &&
    contentLength !== "0" &&
    contentType.includes("application/json")
  ) {
    data = await res.json();
  }

  const nextRes = NextResponse.json(data, { status: res.status });

  res.headers.getSetCookie().forEach((cookie) => {
    nextRes.headers.append("Set-Cookie", cookie);
  });

  return nextRes;
}
