// app/api/v1/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getNotificationsServer } from "@/modules/notification/server/notification.server";
import { notificationQuerySchema } from "@/modules/notification/schemas/notification-query.schema";
import { handleServerError } from "@/modules/shared/lib/bff/handle-server-error";

export async function GET(req: NextRequest) {
    try {
        const rawParams = Object.fromEntries(req.nextUrl.searchParams);

        const parsed = notificationQuerySchema.safeParse(rawParams);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    message: "Invalid query parameters",
                    errors: parsed.error.flatten().fieldErrors,
                },
                { status: 400 },
            );
        }

        const safeParams: Record<string, string> = {};
        if (parsed.data.page !== undefined) safeParams.page = String(parsed.data.page);
        if (parsed.data.size !== undefined) safeParams.size = String(parsed.data.size);

        const qs = new URLSearchParams(safeParams).toString();
        const data = await getNotificationsServer(qs);
        return NextResponse.json(data);
    } catch (error) {
        return handleServerError(error, "Failed to fetch notifications");
    }
}
