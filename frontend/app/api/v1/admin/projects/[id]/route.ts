import { NextRequest, NextResponse } from "next/server";
import { handleServerError } from "@/modules/shared/lib/bff/handle-server-error";
import { validateId } from "@/modules/shared/lib/bff/validate-id";
import {
    deleteProjectServer,
    getAdminProjectDetailServer,
} from "@/modules/admin/projects/server/admin.projects.server";
import { z } from "zod";

const deleteSchema = z.object({
    reason: z.string().min(5, "Reason must be at least 5 characters"),
});

type Context = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Context) {
    try {
        const { id } = await params;
        const invalid = validateId(id);
        if (invalid) return invalid;

        const data = await getAdminProjectDetailServer(id);
        return NextResponse.json(data);
    } catch (error) {
        return handleServerError(error, "Failed to fetch project detail");
    }
}

export async function DELETE(req: NextRequest, { params }: Context) {
    try {
        const { id } = await params;
        const invalid = validateId(id);
        if (invalid) return invalid;

        const parsed = deleteSchema.safeParse(await req.json().catch(() => ({})));
        if (!parsed.success) {
            return NextResponse.json(
                { message: "Invalid payload", errors: parsed.error.flatten() },
                { status: 400 }
            );
        }
        await deleteProjectServer(id, parsed.data.reason);
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return handleServerError(error, "Failed to delete project");
    }
}
