// app/api/v1/contracts/my/summary/route.ts
import { NextResponse } from "next/server";
import { getMyContractsSummaryServer } from "@/modules/contracts/shared/server/contract.shared.server";
import { handleServerError } from "@/modules/shared/lib/bff/handle-server-error";

export async function GET() {
    try {
        const data = await getMyContractsSummaryServer();
        return NextResponse.json(data);
    } catch (error) {
        return handleServerError(error, "Failed to fetch summary");
    }
}
