import { z } from "zod";

/**
 * Validates the `paramsToSign` object sent to the Cloudinary signing endpoint.
 *
 * Only known, safe Cloudinary upload-widget parameters are allowed. This
 * prevents a malicious caller from signing arbitrary parameters (e.g.
 * overriding `resource_type`, injecting `notification_url`, etc.).
 */
export const cloudinarySignSchema = z.object({
    paramsToSign: z
        .record(z.string(), z.union([z.string(), z.number()]))
        .refine(
            (params) => {
                // Must contain a timestamp — required by Cloudinary
                return "timestamp" in params;
            },
            { message: "paramsToSign must contain a 'timestamp' field" },
        ),
});

export type CloudinarySignPayload = z.infer<typeof cloudinarySignSchema>;
