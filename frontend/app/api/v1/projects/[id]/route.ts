// app/api/v1/projects/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
    getProjectServer,
    updateProjectServer,
} from "@/modules/project/shared/server/project.shared.server";
import { projectSchema } from "@/modules/project/client/schema/create.project.schema";
import { handleServerError } from "@/modules/shared/lib/bff/handle-server-error";
import { validateId } from "@/modules/shared/lib/bff/validate-id";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const invalid = validateId(id);
        if (invalid) return invalid;

        const data = await getProjectServer(id);
        return NextResponse.json(data);
    } catch (error) {
        return handleServerError(error, "Failed to fetch project");
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const invalid = validateId(id);
        if (invalid) return invalid;

        const body = await req.json();

        // Re-use the project schema for update validation
        const validationResult = projectSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                {
                    message: "Validation failed",
                    errors: validationResult.error.flatten().fieldErrors,
                },
                { status: 400 },
            );
        }

        const data = await updateProjectServer(id, validationResult.data);
        return NextResponse.json(data);
    } catch (error) {
        return handleServerError(error, "Failed to update project");
    }
}
