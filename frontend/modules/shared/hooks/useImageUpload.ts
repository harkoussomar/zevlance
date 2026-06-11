"use client";

import { useState, useCallback } from "react";
import axios from "axios";
import { compressImage } from "../lib/compressImage";

export type UploadStage =
    | "idle"
    | "compressing"
    | "signing"
    | "uploading"
    | "verifying"
    | "done"
    | "error";

export interface UseUploadOptions {
    folder?: string;
    compress?: boolean;
    onSuccess?: (url: string) => void;
    onError?: (message: string) => void;
}

export interface UseUploadReturn {
    upload: (file: File) => Promise<string | null>;
    stage: UploadStage;
    progress: number; // 0–100 upload progress
    error: string | null;
    reset: () => void;
}

export function useUpload({
    folder = "uploads",
    compress = true,
    onSuccess,
    onError,
}: UseUploadOptions = {}): UseUploadReturn {
    const [stage, setStage] = useState<UploadStage>("idle");
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const reset = useCallback(() => {
        setStage("idle");
        setProgress(0);
        setError(null);
    }, []);

    const upload = useCallback(
        async (file: File): Promise<string | null> => {
            setError(null);
            setProgress(0);

            try {
                // ── 1. Compress ────────────────────────────────────────────────────────
                setStage("compressing");
                const processed = compress ? await compressImage(file) : file;

                // ── 2. Sign ────────────────────────────────────────────────────────────
                setStage("signing");
                const ts = Math.round(Date.now() / 1000);
                const sigRes = await axios.post<{ signature: string }>(
                    "/api/sign-cloudinary-params",
                    { paramsToSign: { folder, timestamp: ts } },
                );
                const { signature } = sigRes.data;

                // ── 3. Upload to Cloudinary with progress ──────────────────────────────
                setStage("uploading");
                const formData = new FormData();
                formData.append("file", processed);
                formData.append("folder", folder);
                formData.append("timestamp", String(ts));
                formData.append("signature", signature);
                formData.append(
                    "api_key",
                    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!,
                );

                const uploadRes = await axios.post<{
                    public_id: string;
                    secure_url: string;
                    width: number;
                    height: number;
                    bytes: number;
                }>(
                    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                    formData,
                    {
                        onUploadProgress: (e) => {
                            if (e.total) {
                                setProgress(
                                    Math.round((e.loaded / e.total) * 100),
                                );
                            }
                        },
                    },
                );

                const uploaded = uploadRes.data;

                // ── 4. Verify on Spring Boot ───────────────────────────────────────────
                // ── 4. Verify on Spring Boot ───────────────────────────────────────────
                setStage("verifying");
                await axios.post("/api/upload/verify", {
                    publicId: uploaded.public_id,
                    secureUrl: uploaded.secure_url,
                });

                // Just use the URL Cloudinary gave you!
                const url = uploaded.secure_url;

                setStage("done");
                onSuccess?.(url);
                return url;
            } catch (e: unknown) {
                const message = axios.isAxiosError(e)
                    ? (e.response?.data?.error ?? e.message)
                    : e instanceof Error
                      ? e.message
                      : "Upload failed";

                setStage("error");
                setError(message);
                onError?.(message);
                return null;
            }
        },
        [folder, compress, onSuccess, onError],
    );

    return { upload, stage, progress, error, reset };
}
