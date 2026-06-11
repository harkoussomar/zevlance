import { NextRequest, NextResponse } from "next/server";
import { getMyBidsServer } from "@/modules/bid/shared/server/bid.shared.server";
import { handleServerError } from "@/modules/shared/lib/bff/handle-server-error";
import { z } from "zod";

const bidFiltersSchema = z.object({
    page: z.coerce.number().min(0).default(0),
    size: z.coerce.number().min(1).max(100).default(10),
    status: z.enum(["PENDING", "ACCEPTED", "REJECTED", "WITHDRAWN"]).optional(),
});

export async function GET(req: NextRequest) {
    try {
        const rawParams = Object.fromEntries(req.nextUrl.searchParams);

        const validation = bidFiltersSchema.safeParse(rawParams);

        if (!validation.success) {
            return NextResponse.json(
                {
                    message: "Invalid query parameters",
                    errors: validation.error.issues,
                },
                { status: 400 },
            );
        }

        const safeParams: Record<string, string> = {};

        if (validation.data.page !== undefined)
            safeParams.page = String(validation.data.page);
        if (validation.data.size !== undefined)
            safeParams.size = String(validation.data.size);
        if (validation.data.status !== undefined)
            safeParams.status = validation.data.status;

        const safeQs = new URLSearchParams(safeParams).toString();

        const data = await getMyBidsServer(safeQs);
        return NextResponse.json(data);
    } catch (error) {
        return handleServerError(error, "Failed to fetch bids");
    }
}
