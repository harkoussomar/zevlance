// app/api/v1/projects/[id]/bids/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
    getProjectBidsServer,
    createProjectBidServer,
} from "@/modules/bid/shared/server/bid.shared.server";
import { createBidSchema } from "@/modules/bid/freelancer/schemas/submit-bid.schema";
import { handleServerError } from "@/modules/shared/lib/bff/handle-server-error";
import { validateId } from "@/modules/shared/lib/bff/validate-id";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const invalid = validateId(id);
        if (invalid) return invalid;

        const data = await getProjectBidsServer(
            id,
            Object.fromEntries(req.nextUrl.searchParams),
        );
        return NextResponse.json(data);
    } catch (error) {
        return handleServerError(error, "Failed to fetch bids");
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const invalid = validateId(id);
        if (invalid) return invalid;

        const body = await req.json();

        const validationResult = createBidSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                {
                    message: "Validation failed",
                    errors: validationResult.error.flatten().fieldErrors,
                },
                { status: 400 },
            );
        }

        const data = await createProjectBidServer(id, validationResult.data);
        return NextResponse.json(data);
    } catch (error) {
        return handleServerError(error, "Failed to create bid");
    }
}
