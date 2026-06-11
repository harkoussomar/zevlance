// app/api/v1/notifications/unread-count/route.ts
import { NextResponse } from "next/server";
import { getUnreadCountServer } from "@/modules/notification/server/notification.server";
import { handleServerError } from "@/modules/shared/lib/bff/handle-server-error";

export async function GET() {
    try {
        const data = await getUnreadCountServer();
        return NextResponse.json(data);
    } catch (error) {
        return handleServerError(error, "Failed to fetch unread count");
    }
}
