// app/api/v1/notifications/[id]/read/route.ts
import { NextRequest, NextResponse } from "next/server";
import { markAsReadServer } from "@/modules/notification/server/notification.server";
import { handleServerError } from "@/modules/shared/lib/bff/handle-server-error";
import { validateId } from "@/modules/shared/lib/bff/validate-id";

export async function PATCH(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const invalid = validateId(id);
        if (invalid) return invalid;

        await markAsReadServer(id);
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return handleServerError(error, "Failed to mark as read");
    }
}
