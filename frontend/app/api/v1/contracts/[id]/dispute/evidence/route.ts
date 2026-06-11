import { NextRequest, NextResponse } from "next/server";
import { addDisputeEvidenceServer } from "@/modules/dispute/server/dispute.server";
import { z } from "zod";
import { validateId } from "@/modules/shared/lib/bff/validate-id";
import { handleServerError } from "@/modules/shared/lib/bff/handle-server-error";

type Context = { params: Promise<{ id: string }> };

const evidenceSchema = z.object({
    publicId: z.string(),
    secureUrl: z.url(),
    fileName: z.string(),
    description: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: Context) {
    try {
        const { id } = await params;
        const invalid = validateId(id);
        if (invalid) return invalid;

        const parsed = evidenceSchema.safeParse(await req.json());
        if (!parsed.success) return NextResponse.json({ message: "Invalid payload" }, { status: 400 });

        const data = await addDisputeEvidenceServer(id, parsed.data);
        return NextResponse.json(data);
    } catch (error) {
        return handleServerError(error, "Failed to add evidence");
    }
}
