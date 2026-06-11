// app/api/v1/milestones/[id]/refund/route.ts
import { NextRequest, NextResponse } from "next/server";
import { refundMilestoneServer } from "@/modules/milestone/shared/server/milestone.shared.server";
import { handleServerError } from "@/modules/shared/lib/bff/handle-server-error";
import { validateId } from "@/modules/shared/lib/bff/validate-id";

export async function POST(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const invalid = validateId(id);
        if (invalid) return invalid;

        await refundMilestoneServer(id);
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return handleServerError(error, "Failed to refund milestone");
    }
}
