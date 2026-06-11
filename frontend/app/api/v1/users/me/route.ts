// app/api/v1/users/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getMyBasicProfileServer } from "@/modules/profile/shared/api/profile.shared.server.api";
import { handleServerError } from "@/modules/shared/lib/bff/handle-server-error";

export async function GET(_req: NextRequest) {
    try {
        const data = await getMyBasicProfileServer();
        return NextResponse.json(data);
    } catch (error) {
        return handleServerError(error, "Failed to fetch user");
    }
}
