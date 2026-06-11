import { NextRequest, NextResponse } from "next/server";
import { getMyContractsServer } from "@/modules/contracts/shared/server/contract.shared.server";
import { handleServerError } from "@/modules/shared/lib/bff/handle-server-error";
import { z } from "zod";

const statusEnum = z.enum(["ACTIVE", "COMPLETED", "CANCELLED", "DISPUTED"]);

const querySchema = z.object({
    status: statusEnum.optional(),
    page: z.coerce.number().min(0).default(0),
    size: z.coerce.number().min(1).max(50).default(10),
});

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl;

        const parsed = querySchema.safeParse(
            Object.fromEntries(searchParams.entries()),
        );

        if (!parsed.success) {
            return NextResponse.json(
                { message: "Invalid query params", errors: parsed.error.flatten() },
                { status: 400 },
            );
        }

        const data = await getMyContractsServer(parsed.data);

        return NextResponse.json(data);
    } catch (error) {
        return handleServerError(error, "Failed to fetch contracts");
    }
}
