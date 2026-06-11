// app/api/v1/contracts/[id]/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import { leaveContractReviewServer } from "@/modules/contracts/shared/server/contract.shared.server";
import { leaveReviewSchema } from "@/modules/review/schemas/review.schema";
import { handleServerError } from "@/modules/shared/lib/bff/handle-server-error";
import { validateId } from "@/modules/shared/lib/bff/validate-id";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const invalid = validateId(id);
        if (invalid) return invalid;

        const body = await req.json();

        const validationResult = leaveReviewSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                {
                    message: "Validation failed",
                    errors: validationResult.error.flatten().fieldErrors,
                },
                { status: 400 },
            );
        }

        const data = await leaveContractReviewServer(id, validationResult.data);
        return NextResponse.json(data);
    } catch (error) {
        return handleServerError(error, "Failed to leave review");
    }
}
