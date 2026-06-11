// app/api/v1/notifications/read-all/route.ts
import { NextResponse } from "next/server";
import { markAllAsReadServer } from "@/modules/notification/server/notification.server";
import { handleServerError } from "@/modules/shared/lib/bff/handle-server-error";

export async function PATCH() {
    try {
        await markAllAsReadServer();
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return handleServerError(error, "Failed to mark all as read");
    }
}
