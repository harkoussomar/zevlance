// app/api/v1/contracts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getContractServer } from "@/modules/contracts/shared/server/contract.shared.server";
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

        const data = await getContractServer(id);
        return NextResponse.json(data);
    } catch (error) {
        return handleServerError(error, "Failed to fetch contract");
    }
}
