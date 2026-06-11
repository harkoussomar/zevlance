// app/api/upload/verify/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";

// 1. ADD secureUrl to your validation schema
const verifySchema = z.object({
    publicId: z.string().min(1, "publicId is required"),
    secureUrl: z.url("secureUrl must be a valid URL"),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const validationResult = verifySchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                {
                    message: "Validation failed",
                    errors: validationResult.error.flatten().fieldErrors,
                },
                { status: 400 },
            );
        }

        // 2. Extract BOTH variables
        const { publicId, secureUrl } = validationResult.data;

        const cookieHeader = request.headers.get("cookie") || "";

        const res = await fetch(
            `${process.env.BACKEND_INTERNAL_URL}/upload/verify`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Internal-Token": process.env.INTERNAL_API_SECRET || "",
                    ...(cookieHeader ? { Cookie: cookieHeader } : {}),
                },
                // 3. Send BOTH to Spring Boot
                body: JSON.stringify({ publicId, secureUrl }), 
            },
        );

        if (!res.ok) {
            const errorDetails = await res.text();
            console.error("❌ Spring Boot Error:", res.status, errorDetails);

            return NextResponse.json(
                { message: "Server rejected upload verification", backendError: errorDetails },
                { status: res.status },
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to verify upload:", error);
        return NextResponse.json(
            { message: "Failed to verify upload" },
            { status: 500 },
        );
    }
}