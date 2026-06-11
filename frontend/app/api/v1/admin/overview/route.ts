import { NextResponse } from "next/server";
import { handleServerError } from "@/modules/shared/lib/bff/handle-server-error";
import { getPlatformStatsServer } from "@/modules/admin/overview/server/admin.overview.server";

export async function GET() {
    try {
        const data = await getPlatformStatsServer();
        return NextResponse.json(data);
    } catch (error) {
        return handleServerError(error, "Failed to fetch platform stats");
    }
}
