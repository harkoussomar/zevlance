// app/api/v1/users/me/freelancer-profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getMyFreelancerProfileServer } from "@/modules/profile/freelancer/api/profile.freelancer.server.api";
import { updateFreelancerProfileServer } from "@/modules/settings/freelancer/server/settings.freelancer.server";
import { updateFreelancerProfileSchema } from "@/modules/settings/freelancer/schemas/update-freelancer-profile.schema";
import { handleServerError } from "@/modules/shared/lib/bff/handle-server-error";

export async function GET(_req: NextRequest) {
    try {
        const data = await getMyFreelancerProfileServer();
        return NextResponse.json(data);
    } catch (error) {
        return handleServerError(error, "Failed to fetch freelancer profile");
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();

        const validationResult = updateFreelancerProfileSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                {
                    message: "Validation failed",
                    errors: validationResult.error.flatten().fieldErrors,
                },
                { status: 400 },
            );
        }

        const data = await updateFreelancerProfileServer(validationResult.data);
        return NextResponse.json(data);
    } catch (error) {
        return handleServerError(error, "Failed to update freelancer profile");
    }
}
