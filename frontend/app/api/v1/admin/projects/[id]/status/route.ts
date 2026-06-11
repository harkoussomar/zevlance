import { NextRequest, NextResponse } from "next/server";
import { handleServerError } from "@/modules/shared/lib/bff/handle-server-error";
import { validateId } from "@/modules/shared/lib/bff/validate-id";
import { changeProjectStatusServer } from "@/modules/admin/projects/server/admin.projects.server";
import { z } from "zod";

const schema = z.object({
    status: z.enum(["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED", "SUSPENDED"]),
    reason: z.string().min(5, "Reason must be at least 5 characters"),
});

type Context = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Context) {
    try {
        const { id } = await params;
        const invalid = validateId(id);
        if (invalid) return invalid;

        const parsed = schema.safeParse(await req.json().catch(() => ({})));
        if (!parsed.success) {
            return NextResponse.json(
                { message: "Invalid payload", errors: parsed.error.flatten() },
                { status: 400 }
            );
        }
        await changeProjectStatusServer({ id, ...parsed.data });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return handleServerError(error, "Failed to change project status");
    }
}