import { NextRequest, NextResponse } from "next/server";
import { registerFreelancerServer } from "@/modules/auth/server/auth.server";
import { registerFreelancerSchema } from "@/modules/auth/schemas/register.schema";
import { handleServerError } from "@/modules/shared/lib/bff/handle-server-error";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const validationResult = registerFreelancerSchema.safeParse(body);

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
        return await registerFreelancerServer(payload);
    } catch (error) {
        return handleServerError(error, "Registration failed");
    }
}