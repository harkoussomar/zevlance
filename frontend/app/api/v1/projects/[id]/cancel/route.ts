// app/api/v1/projects/[id]/cancel/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cancelProjectServer } from "@/modules/project/shared/server/project.shared.server";
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

        await cancelProjectServer(id);
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return handleServerError(error, "Failed to cancel project");
    }
}
