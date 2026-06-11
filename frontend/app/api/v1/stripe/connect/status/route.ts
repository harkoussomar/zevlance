// app/api/v1/stripe/connect/status/route.ts
import { NextResponse } from "next/server";
import { getStripeConnectStatusServer } from "@/modules/payment/server/payment.server";
import { handleServerError } from "@/modules/shared/lib/bff/handle-server-error";

export async function GET() {
    try {
        const data = await getStripeConnectStatusServer();
        return NextResponse.json(data);
    } catch (error) {
        return handleServerError(error, "Failed to fetch Stripe connection status");
    }
}
