// app/api/sign-cloudinary-params/route.ts
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { cloudinarySignSchema } from "@/modules/shared/schemas/cloudinary-sign.schema";

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const validationResult = cloudinarySignSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                {
                    message: "Invalid signing parameters",
                    errors: validationResult.error.flatten().fieldErrors,
                },
                { status: 400 },
            );
        }

        const { paramsToSign } = validationResult.data;

        const signature = cloudinary.utils.api_sign_request(
            paramsToSign,
            process.env.CLOUDINARY_API_SECRET as string,
        );

        return NextResponse.json({ signature });
    } catch (error) {
        console.error("Cloudinary signing failed:", error);
        return NextResponse.json(
            { message: "Failed to sign Cloudinary request" },
            { status: 500 },
        );
    }
}