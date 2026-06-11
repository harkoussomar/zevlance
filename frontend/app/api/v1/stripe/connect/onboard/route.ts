// app/api/v1/stripe/connect/onboard/route.ts
import { NextResponse } from "next/server";
import { startStripeOnboardingServer } from "@/modules/payment/server/payment.server";
import { handleServerError } from "@/modules/shared/lib/bff/handle-server-error";

export async function POST() {
    try {
        const data = await startStripeOnboardingServer();
        return NextResponse.json(data);
    } catch (error) {
        return handleServerError(error, "Failed to start Stripe onboarding");
    }
}
