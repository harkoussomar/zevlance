import { NextRequest, NextResponse } from "next/server";
import { verifyEmailServer } from "@/modules/auth/server/auth.server";
import { handleServerError } from "@/modules/shared/lib/bff/handle-server-error";

export async function POST(req: NextRequest) {
    try {
        const token = req.nextUrl.searchParams.get("token");

        if (!token) {
            return NextResponse.json(
                { message: "Token is required" },
                { status: 400 },
            );
        }

        return await verifyEmailServer(token);
    } catch (error) {
        return handleServerError(error, "Verification failed");
    }
}