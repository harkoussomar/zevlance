import { NextRequest, NextResponse } from "next/server";
import { resetPasswordServer } from "@/modules/auth/server/auth.server";
import { resetPasswordSchema } from "@/modules/auth/schemas/reset-password.schema";
import { handleServerError } from "@/modules/shared/lib/bff/handle-server-error";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const validationResult = resetPasswordSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                {
                    message: "Validation failed",
                    errors: validationResult.error.flatten().fieldErrors,
                },
                { status: 400 },
            );
        }

        // Strip confirmPassword — the backend doesn't expect it
        const { confirmPassword: _confirmPassword, ...payload } = validationResult.data;
        return await resetPasswordServer(payload);
    } catch (error) {
        return handleServerError(error, "Reset failed");
    }
}