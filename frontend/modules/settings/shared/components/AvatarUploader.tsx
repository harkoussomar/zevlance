// ─── features/settings/components/AvatarUploader.tsx ─────────────────────────

"use client";

import Image from "next/image";
import { useCallback,useState } from "react";
import { Camera, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/modules/shared";
import { Button } from "@/modules/shared/components/button";
import { FileUploader } from "@/modules/shared/components/FileUploader";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AvatarUploaderProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  /** Called immediately after a successful upload so the parent can persist */
  onSave?: (url: string) => Promise<void>;
  size?: "sm" | "md" | "lg";
}

const SIZE_MAP = {
  sm: { container: "h-14 w-14", icon: "h-5 w-5", camera: "h-3 w-3" },
  md: { container: "h-20 w-20", icon: "h-7 w-7", camera: "h-3.5 w-3.5" },
  lg: { container: "h-24 w-24", icon: "h-8 w-8", camera: "h-4 w-4" },
} as const;

// ─── Circular progress ring ───────────────────────────────────────────────────

function ProgressRing({
  progress,
  size,
}: {
  progress: number;
  size: number;
}) {
  const radius = (size - 4) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      className="absolute inset-0 -rotate-90"
      style={{ zIndex: 10 }}
    >
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="text-background/30"
      />
      {/* Progress */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="text-primary transition-all duration-300"
      />
    </svg>
  );
}

// ─── AvatarUploader ───────────────────────────────────────────────────────────

export function AvatarUploader({
  value,
  onChange,
  folder = "avatars",
  onSave,
  size = "lg",
}: AvatarUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const sizes = SIZE_MAP[size];

  const handleSuccess = useCallback(
    async (url: string) => {
      onChange(url);
      await onSave?.(url);
    },
    [onChange, onSave],
  );

  const handleRemove = useCallback(async () => {
    onChange("");
    await onSave?.("");
  }, [onChange, onSave]);

  return (
    <div className="flex items-center gap-5">
      {/* ── Avatar circle ────────────────────────────────────────────── */}
      <FileUploader
        folder={folder}
        accept={["image/jpeg", "image/png", "image/webp"]}
        maxBytes={5 * 1024 * 1024}
        onSuccess={handleSuccess}
      >
        {({ open, stage, progress }) => {
          const isBusy = ["compressing", "signing", "uploading", "verifying"].includes(stage);
          const ringSize = size === "lg" ? 96 : size === "md" ? 80 : 56;

          return (
            <div className="relative hrink-0">
              {/* Progress ring wraps the avatar */}
              {isBusy && (
                <ProgressRing progress={progress} size={ringSize} />
              )}

              <button
                type="button"
                onClick={isBusy ? undefined : open}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  // FileUploader handles the actual upload via open()
                }}
                disabled={isBusy}
                aria-label="Change profile picture"
                className={cn(
                  "group relative overflow-hidden rounded-full border-2 border-border bg-muted transition-all duration-200",
                  sizes.container,
                  !isBusy && "cursor-pointer hover:border-primary/60",
                  isDragging && "border-primary scale-105",
                  isBusy && "cursor-default",
                )}
              >
                {/* ── Image / placeholder ─────────────────────────── */}
                {value ? (
                  <Image
                    src={value}
                    alt="Profile picture"
                    fill
                    unoptimized
                    className={cn(
                      "object-cover transition-all duration-300",
                      isBusy && "opacity-40 blur-[1px]",
                    )}
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <svg
                      className={cn(sizes.icon, "text-muted-foreground")}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                    </svg>
                  </div>
                )}

                {/* ── Hover overlay ───────────────────────────────── */}
                {!isBusy && (
                  <div className="absolute inset-0 flex items-center justify-center bg-foreground/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100 rounded-full">
                    <Camera className={cn(sizes.camera, "text-background")} />
                  </div>
                )}

                {/* ── Loading overlay ─────────────────────────────── */}
                {isBusy && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 rounded-full">
                    <Loader2 className={cn(sizes.camera, "text-primary animate-spin")} />
                    {stage === "uploading" && (
                      <span className="mt-1 text-[9px] font-semibold tabular-nums text-primary">
                        {progress}%
                      </span>
                    )}
                  </div>
                )}
              </button>
            </div>
          );
        }}
      </FileUploader>

      {/* ── Text info + actions ──────────────────────────────────────────── */}
      <div className="space-y-2 min-w-0">
        <div>
          <p className="text-sm font-medium text-foreground">Profile photo</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            JPG, PNG or WebP · max 5 MB
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <FileUploader
            folder={folder}
            accept={["image/jpeg", "image/png", "image/webp"]}
            maxBytes={5 * 1024 * 1024}
            onSuccess={handleSuccess}
          >
            {({ open, stage }) => {
              const isBusy = ["compressing", "signing", "uploading", "verifying"].includes(stage);
              return (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isBusy}
                  onClick={open}
                  className="h-8 text-xs"
                >
                  {isBusy ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Camera className="h-3 w-3" />
                  )}
                  {value ? "Change photo" : "Upload photo"}
                </Button>
              );
            }}
          </FileUploader>

          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="h-8 text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}