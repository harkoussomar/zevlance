import "server-only";
import { NextResponse } from "next/server";

const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validates that a dynamic route `[id]` parameter is a well-formed UUID.
 *
 * Returns `null` when the id is valid, or a `NextResponse` 400 error that the
 * route handler can return directly.
 *
 * Usage:
 * ```ts
 * const invalid = validateId(id);
 * if (invalid) return invalid;
 * ```
 */
export function validateId(id: string): NextResponse | null {
    if (!id || !UUID_REGEX.test(id)) {
        return NextResponse.json(
            { message: "Invalid ID format — expected a UUID" },
            { status: 400 },
        );
    }
    return null;
}
