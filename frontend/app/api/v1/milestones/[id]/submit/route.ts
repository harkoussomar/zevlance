// app/api/v1/milestones/[id]/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { submitMilestoneServer } from "@/modules/milestone/shared/server/milestone.shared.server";
import { submitDeliverableSchema } from "@/modules/milestone/freelancer/schemas/submit-deliverable.schema";
import { handleServerError } from "@/modules/shared/lib/bff/handle-server-error";
import { validateId } from "@/modules/shared/lib/bff/validate-id";

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const invalid = validateId(id);
        if (invalid) return invalid;

        const body = await req.json();

        const validationResult = submitDeliverableSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                {
                    message: "Validation failed",
                    errors: validationResult.error.flatten().fieldErrors,
                },
                { status: 400 },
            );
        }

        const data = await submitMilestoneServer(id, validationResult.data);
        return NextResponse.json(data);
    } catch (error) {
        return handleServerError(error, "Failed to submit deliverable");
    }
}
