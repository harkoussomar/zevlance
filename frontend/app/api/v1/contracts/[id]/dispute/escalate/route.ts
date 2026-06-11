import { NextRequest, NextResponse } from "next/server";
import { escalateDisputeServer } from "@/modules/dispute/server/dispute.server";
import { validateId } from "@/modules/shared/lib/bff/validate-id";
import { handleServerError } from "@/modules/shared/lib/bff/handle-server-error";

type Context = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Context) {
    try {
        const { id } = await params;
        const invalid = validateId(id);
        if (invalid) return invalid;

        await escalateDisputeServer(id);
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return handleServerError(error, "Failed to escalate dispute");
    }
}
