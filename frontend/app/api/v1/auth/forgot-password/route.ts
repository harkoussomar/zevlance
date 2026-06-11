import { NextRequest, NextResponse } from "next/server";
import { forgotPasswordServer } from "@/modules/auth/server/auth.server";
import { forgotPasswordSchema } from "@/modules/auth/schemas/forgot-password.schema";
import { handleServerError } from "@/modules/shared/lib/bff/handle-server-error";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const validationResult = forgotPasswordSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                {
                    message: "Validation failed",
                    errors: validationResult.error.flatten().fieldErrors,
                },
                { status: 400 },
            );
        }

        return await forgotPasswordServer(validationResult.data);
    } catch (error) {
        return handleServerError(error, "Request failed");
    }
}