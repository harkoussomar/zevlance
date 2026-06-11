// app/api/v1/contracts/[id]/milestones/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
    getContractMilestonesServer,
    createContractMilestoneServer,
} from "@/modules/contracts/shared/server/contract.shared.server";
import { addMilestoneSchema } from "@/modules/milestone/client/schemas/add-milestone.schema";
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

        const data = await getContractMilestonesServer(id);
        return NextResponse.json(data);
    } catch (error) {
        return handleServerError(error, "Failed to fetch milestones");
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;
        const invalid = validateId(id);
        if (invalid) return invalid;

        const body = await req.json();

        const validationResult = addMilestoneSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                {
                    message: "Validation failed",
                    errors: validationResult.error.flatten().fieldErrors,
                },
                { status: 400 },
            );
        }

        const data = await createContractMilestoneServer(id, validationResult.data);
        return NextResponse.json(data);
    } catch (error) {
        return handleServerError(error, "Failed to create milestone");
    }
}
