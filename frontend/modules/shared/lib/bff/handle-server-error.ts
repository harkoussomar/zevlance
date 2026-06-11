import "server-only";
import { NextResponse } from "next/server";
import { ServerFetchError } from "./server-fetch";

/**
 * Centralised BFF error handler.
 */
export function handleServerError(
  error: unknown,
  fallbackMessage: string,
): NextResponse {
  if (error instanceof ServerFetchError) {
    // Expected Spring Boot error. Passed quietly to client.
    return NextResponse.json(
      error.data ?? { message: error.message },
      { status: error.status },
    );
  }

  // Unexpected Node.js/Next.js error
  console.error(`[BFF 💥] UNEXPECTED ERROR - ${fallbackMessage}:`, error);
  
  return NextResponse.json(
    { message: fallbackMessage },
    { status: 500 },
  );
}