// app/api/v1/bids/my/summary/route.ts
import { NextResponse } from "next/server";
import { getMyBidsSummaryServer } from "@/modules/bid/shared/server/bid.shared.server";
import { handleServerError } from "@/modules/shared/lib/bff/handle-server-error";

export async function GET() {
    try {
        const data = await getMyBidsSummaryServer();
        return NextResponse.json(data);
    } catch (error) {
        return handleServerError(error, "Failed to fetch bid summary");
    }
}
