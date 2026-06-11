import { NextRequest, NextResponse } from "next/server";
import { sendDisputeMessageServer } from "@/modules/dispute/server/dispute.server";
import { z } from "zod";
import { validateId } from "@/modules/shared/lib/bff/validate-id";
import { handleServerError } from "@/modules/shared/lib/bff/handle-server-error";

type Context = { params: Promise<{ id: string }> };

const msgSchema = z.object({ message: z.string().min(1) });

export async function POST(req: NextRequest, { params }: Context) {
    try {
        const { id } = await params;
        const invalid = validateId(id);
        if (invalid) return invalid;

        const parsed = msgSchema.safeParse(await req.json());
        if (!parsed.success) return NextResponse.json({ message: "Invalid payload" }, { status: 400 });

        const data = await sendDisputeMessageServer(id, parsed.data.message);
        return NextResponse.json(data);
    } catch (error) {
        return handleServerError(error, "Failed to send message");
    }
}
