import { NextRequest, NextResponse } from "next/server";
import { registerClientServer } from "@/modules/auth/server/auth.server";
import { registerClientSchema } from "@/modules/auth/schemas/register.schema";
import { handleServerError } from "@/modules/shared/lib/bff/handle-server-error";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const validationResult = registerClientSchema.safeParse(body);

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
        return await registerClientServer(payload);
    } catch (error) {
        return handleServerError(error, "Registration failed");
    }
}