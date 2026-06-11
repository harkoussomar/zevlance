// app/api/v1/users/me/client-profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getMyClientProfileServer } from "@/modules/profile/client/api/profile.client.server.api";
import { updateClientProfileServer } from "@/modules/settings/client/server/settings.client.server";
import { updateClientProfileSchema } from "@/modules/settings/client/schemas/update-client-profile.schema";
import { handleServerError } from "@/modules/shared/lib/bff/handle-server-error";

export async function GET(_req: NextRequest) {
    try {
        const data = await getMyClientProfileServer();
        return NextResponse.json(data);
    } catch (error: unknown) {
        // ✅ Strict TS: Catch as unknown

        if (typeof error === "object" && error !== null && "status" in error) {
            const fetchError = error as { status: number };

            if (fetchError.status === 403 || fetchError.status === 404) {
                return NextResponse.json(null);
            }
        }

        return handleServerError(error, "Failed to fetch client profile");
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();

        const validationResult = updateClientProfileSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                {
                    message: "Validation failed",
                    errors: validationResult.error.flatten().fieldErrors,
                },
                { status: 400 },
            );
        }

        const data = await updateClientProfileServer(validationResult.data);
        return NextResponse.json(data);
    } catch (error: unknown) {
        // ✅ Strict TS: Catch as unknown
        return handleServerError(error, "Failed to update client profile");
    }
}
