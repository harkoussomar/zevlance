// app/api/v1/bids/[id]/reject/route.ts
import { NextRequest, NextResponse } from "next/server";
import { rejectBidServer } from "@/modules/bid/shared/server/bid.shared.server";
import { handleServerError } from "@/modules/shared/lib/bff/handle-server-error";
import { validateId } from "@/modules/shared/lib/bff/validate-id";

export async function PUT(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const invalid = validateId(id);
        if (invalid) return invalid;

        const data = await rejectBidServer(id);
        return NextResponse.json(data);
    } catch (error) {
        return handleServerError(error, "Failed to reject bid");
    }
}
