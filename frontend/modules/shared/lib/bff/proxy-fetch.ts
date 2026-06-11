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

  // --- NEW DETAILED DEBUGGING LOGIC ---
  const bffToken = process.env.INTERNAL_API_SECRET || "";
  const maskedBffToken = bffToken.length > 4 
    ? `${bffToken.substring(0, 2)}***${bffToken.substring(bffToken.length - 2)}` 
    : (bffToken ? "***" : "EMPTY");

  // --- DEV LOG 1: OUTGOING REQUEST ---
  console.log(`\n[BFF 🌐] ➡️ Sending ${method} to: ${url}`);
  console.log(`[BFF 🛡️] Next.js is sending token: '${maskedBffToken}' (length: ${bffToken.length})`);

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Token": bffToken, // Using the variable we defined above
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    ...(options.body !== undefined
      ? { body: JSON.stringify(options.body) }
      : {}),
  });

  // --- DEV LOG 2: SPRING BOOT RESPONSE ---
  const isSuccess = res.status >= 200 && res.status < 300;
  console.log(`[BFF 🌐] ${isSuccess ? "✅" : "❌"} Spring Boot returned Status: ${res.status}`);

  let data: unknown = null;
  const contentType = res.headers.get("content-type") ?? "";
  const contentLength = res.headers.get("content-length");

  if (
    res.status !== 204 &&
    contentLength !== "0" &&
    contentType.includes("application/json")
  ) {
    data = await res.json();
    
    // --- DEV LOG 3: THE ERROR BODY (IF APPLICABLE) ---
    if (!isSuccess) {
        console.log(`[BFF ⚠️] Error Payload from Spring:`, data);
    }
  }

  const nextRes = NextResponse.json(data, { status: res.status });

  res.headers.getSetCookie().forEach((cookie) => {
    nextRes.headers.append("Set-Cookie", cookie);
  });

  return nextRes;
}