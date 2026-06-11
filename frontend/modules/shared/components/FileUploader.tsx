"use client";

import { useId, useState, useCallback } from "react";
import { Upload, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/modules/shared";
import {
    UploadStage,
    useUpload,
    UseUploadOptions,
} from "@/modules/shared/hooks/useImageUpload";

export interface FileUploaderProps extends UseUploadOptions {
    accept?: string[];
    maxBytes?: number;
    label?: string;
    hint?: string;
    className?: string;
    children?: (args: {
        open: () => void;
        stage: UploadStage;
        progress: number;
    }) => React.ReactNode;
}

const STAGE_LABELS: Record<UploadStage, string> = {
    idle: "Drop a file or click to browse",
    compressing: "Compressing…",
    signing: "Preparing upload…",
    uploading: "Uploading…",
    verifying: "Verifying…",
    done: "Upload complete",
    error: "Upload failed",
};

export function FileUploader({
    accept = ["image/jpeg", "image/png", "image/webp"],
    maxBytes = 5 * 1024 * 1024,
    label,
    hint,
    className,
    children,
    ...uploadOptions
}: FileUploaderProps) {
    const inputId = useId();
    const [dragging, setDragging] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    const { upload, stage, progress, error, reset } = useUpload(uploadOptions);

    const busy = ["compressing", "signing", "uploading", "verifying"].includes(
        stage,
    );

    const validate = useCallback(
        (file: File): string | null => {
            if (!accept.includes(file.type))
                return `Accepted formats: ${accept.map((a) => a.split("/")[1]).join(", ")}`;
            if (file.size > maxBytes)
                return `File must be under ${Math.round(maxBytes / 1024 / 1024)} MB`;
            return null;
        },
        [accept, maxBytes],
    );

    const open = useCallback(
        () => document.getElementById(inputId)?.click(),
        [inputId],
    );

    const handleFile = useCallback(
        async (file: File) => {
            setValidationError(null);
            reset();
            const err = validate(file);
            if (err) {
                setValidationError(err);
                return;
            }
            await upload(file);
        },
        [upload, reset, validate],
    );

    function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
        e.target.value = "";
    }

    function onDrop(e: React.DragEvent) {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    }

    const displayError = validationError ?? error;

    // ── Render slot (trigger UI injected by parent) ────────────────────────────
    if (children) {
        return (
            <>
                {children({
                    open,
                    stage,
                    progress,
                })}
                <input
                    id={inputId}
                    type="file"
                    accept={accept.join(",")}
                    className="hidden"
                    onChange={onInputChange}
                />
                {displayError && (
                    <p className="text-xs text-destructive mt-1">
                        {displayError}
                    </p>
                )}
            </>
        );
    }

    // ── Default drop-zone UI ───────────────────────────────────────────────────
    return (
        <div className={cn("space-y-2", className)}>
            {label && (
                <p className="text-sm font-medium text-foreground">{label}</p>
            )}

            <div
                onClick={() => !busy && open()}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={cn(
                    "relative flex flex-col items-center justify-center gap-3",
                    "rounded-xl border-2 border-dashed px-6 py-10 transition-all duration-200",
                    "select-none",
                    busy
                        ? "cursor-default opacity-80"
                        : "cursor-pointer hover:border-primary/60 hover:bg-muted/40",
                    dragging && "border-primary bg-primary/5 scale-[1.01]",
                    stage === "done" && "border-green-500/40 bg-green-500/5",
                    stage === "error" &&
                        "border-destructive/40 bg-destructive/5",
                    !dragging && stage === "idle" && "border-border",
                )}
            >
                {/* ── Icon ──────────────────────────────────────────────────────── */}
                <div
                    className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
                        stage === "done"
                            ? "bg-green-500/10"
                            : stage === "error"
                              ? "bg-destructive/10"
                              : busy
                                ? "bg-primary/10"
                                : "bg-muted",
                    )}
                >
                    {stage === "done" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : stage === "error" ? (
                        <AlertCircle className="h-5 w-5 text-destructive" />
                    ) : busy ? (
                        <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    ) : (
                        <Upload className="h-5 w-5 text-muted-foreground" />
                    )}
                </div>

                {/* ── Label ─────────────────────────────────────────────────────── */}
                <div className="text-center space-y-1">
                    <p
                        className={cn(
                            "text-sm font-medium",
                            stage === "done"
                                ? "text-green-600 dark:text-green-400"
                                : stage === "error"
                                  ? "text-destructive"
                                  : "text-foreground",
                        )}
                    >
                        {STAGE_LABELS[stage]}
                    </p>
                    {stage === "idle" && (
                        <p className="text-xs text-muted-foreground">
                            {hint ??
                                `${accept.map((a) => a.split("/")[1].toUpperCase()).join(", ")} · max ${Math.round(maxBytes / 1024 / 1024)} MB`}
                        </p>
                    )}
                    {stage === "uploading" && (
                        <p className="text-xs text-muted-foreground tabular-nums">
                            {progress}%
                        </p>
                    )}
                </div>

                {/* ── Progress bar ──────────────────────────────────────────────── */}
                {(busy || stage === "done") && (
                    <div className="w-full max-w-xs">
                        <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-300",
                                    stage === "done"
                                        ? "bg-green-500"
                                        : "bg-primary",
                                )}
                                style={{
                                    width:
                                        stage === "done"
                                            ? "100%"
                                            : stage === "uploading"
                                              ? `${progress}%`
                                              : stage === "verifying"
                                                ? "95%"
                                                : "30%",
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* ── Retry ─────────────────────────────────────────────────────── */}
                {stage === "error" && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            reset();
                        }}
                        className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
                    >
                        Try again
                    </button>
                )}

                <input
                    id={inputId}
                    type="file"
                    accept={accept.join(",")}
                    className="hidden"
                    onChange={onInputChange}
                />
            </div>

            {/* ── Validation / upload error ──────────────────────────────────── */}
            {displayError && (
                <p className="flex items-center gap-1.5 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3 flex-shrink-0" />
                    {displayError}
                </p>
            )}
        </div>
    );
}
