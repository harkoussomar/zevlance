import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resolveDisputeServer } from "@/modules/dispute/server/dispute.server";
import { validateId } from "@/modules/shared/lib/bff/validate-id";
import { handleServerError } from "@/modules/shared/lib/bff/handle-server-error";

type Context = { params: Promise<{ id: string }> };

const schema = z.object({
    outcome: z.enum(["FREELANCER_WINS", "CLIENT_WINS"]),
    explanation: z.string().min(20, "Explanation must be at least 20 characters").max(1000),
});

export async function PUT(req: NextRequest, { params }: Context) {
    try {
        const { id } = await params;
        const invalid = validateId(id);
        if (invalid) return invalid;

        const parsed = schema.safeParse(await req.json().catch(() => ({})));
        if (!parsed.success) {
            return NextResponse.json(
                { message: "Invalid payload", errors: parsed.error.flatten() },
                { status: 400 },
            );
        }

        await resolveDisputeServer(id, parsed.data);
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return handleServerError(error, "Failed to resolve dispute");
    }
}
