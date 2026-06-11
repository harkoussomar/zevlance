import { NextRequest, NextResponse } from "next/server";
import { handleServerError } from "@/modules/shared/lib/bff/handle-server-error";
import { validateId } from "@/modules/shared/lib/bff/validate-id";
import { getDisputeDetailsServer } from "@/modules/dispute/server/dispute.server";
import { z } from "zod";
import { disputeContractServer } from "@/modules/contracts/shared/server/contract.shared.server";

type Context = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Context) {
    try {
        const { id } = await params;
        const invalid = validateId(id);
        if (invalid) return invalid;

        const data = await getDisputeDetailsServer(id);
        return NextResponse.json(data);
    } catch (error) {
        return handleServerError(error, "Failed to get dispute details");
    }
}

const disputeSchema = z.object({
    reason: z.string().min(5, "Reason must be at least 5 characters"),
    category: z.enum([
        "DELIVERABLE_QUALITY",
        "NON_DELIVERY",
        "SCOPE_CHANGE",
        "PAYMENT_ISSUE",
        "UNRESPONSIVE",
        "OTHER",
    ]).default("OTHER"),
});

export async function PUT(req: NextRequest, { params }: Context) {
    try {
        const { id } = await params;
        const invalid = validateId(id);
        if (invalid) return invalid;

        const parsed = disputeSchema.safeParse(await req.json());
        if (!parsed.success) {
            return NextResponse.json({ message: "Invalid payload", errors: parsed.error.flatten() }, { status: 400 });
        }

        const data = await disputeContractServer(id, parsed.data);
        return NextResponse.json(data);
    } catch (error) {
        return handleServerError(error, "Failed to open dispute");
    }
}
