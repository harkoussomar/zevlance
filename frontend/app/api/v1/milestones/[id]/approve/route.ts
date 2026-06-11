// app/api/v1/milestones/[id]/approve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { approveMilestoneServer } from "@/modules/milestone/shared/server/milestone.shared.server";
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

        const data = await approveMilestoneServer(id);
        return NextResponse.json(data);
    } catch (error) {
        return handleServerError(error, "Failed to approve milestone");
    }
}
