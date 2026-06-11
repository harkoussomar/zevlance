// app/api/v1/freelancers/[id]/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getFreelancerReviewsServer } from "@/modules/review/server/review.server";
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

        const data = await getFreelancerReviewsServer(id);
        return NextResponse.json(data);
    } catch (error) {
        return handleServerError(error, "Failed to fetch freelancer reviews");
    }
}
