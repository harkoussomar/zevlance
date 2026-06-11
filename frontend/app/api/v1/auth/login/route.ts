import { NextRequest, NextResponse } from "next/server";
import { loginServer } from "@/modules/auth/server/auth.server";
import { loginSchema } from "@/modules/auth/schemas/login.schema";
import { handleServerError } from "@/modules/shared/lib/bff/handle-server-error";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const validationResult = loginSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    message: "Validation failed",
                    errors: validationResult.error.flatten().fieldErrors,
                },
                { status: 400 },
            );
        }

        return await loginServer(validationResult.data);
    } catch (error) {
        return handleServerError(error, "Login failed");
    }
}