// app/api/v1/milestones/[id]/revision/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requestRevisionServer } from "@/modules/milestone/shared/server/milestone.shared.server";
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

        const data = await requestRevisionServer(id);
        return NextResponse.json(data);
    } catch (error) {
        return handleServerError(error, "Failed to request revision");
    }
}
