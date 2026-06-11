// app/api/v1/users/me/password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { changePasswordServer } from "@/modules/settings/shared/server/settings.shared.server";
import { changePasswordSchema } from "@/modules/settings/shared/schemas/change-password.schema";
import { handleServerError } from "@/modules/shared/lib/bff/handle-server-error";

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();

        const validationResult = changePasswordSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                {
                    message: "Validation failed",
                    errors: validationResult.error.flatten().fieldErrors,
                },
                { status: 400 },
            );
        }

        // Reconstruct payload without confirmNewPassword
        const { currentPassword, newPassword } = validationResult.data;
        await changePasswordServer({ currentPassword, newPassword });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return handleServerError(error, "Failed to change password");
    }
}
