import * as React from "react";
import { cn } from "@/modules/shared";

/* ─── Skeleton ───────────────────────────────────────────────────────────────
   Shimmer loading placeholders. Use the primitive + preset compositions
   to avoid hand-crafting loading states per-page.
   ─────────────────────────────────────────────────────────────────────────── */

/* ── Primitive ──────────────────────────────────────────────────────────── */

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="skeleton"
            aria-hidden="true"
            className={cn("animate-pulse rounded-md bg-muted", className)}
            {...props}
        />
    );
}

/* ── Text block ──────────────────────────────────────────────────────────── */

function SkeletonText({
    lines = 3,
    lastLineWidth = "3/4",
    className,
}: {
    lines?: number;
    lastLineWidth?: "1/2" | "2/3" | "3/4" | "full";
    className?: string;
}) {
    return (
        <div className={cn("space-y-2", className)}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={cn(
                        "h-3.5",
                        i === lines - 1 && lines > 1
                            ? `w-${lastLineWidth}`
                            : "w-full",
                    )}
                />
            ))}
        </div>
    );
}

/* ── Card ────────────────────────────────────────────────────────────────── */

function SkeletonCard({ className }: { className?: string }) {
    return (
        <div
            data-slot="skeleton-card"
            className={cn(
                "p-6 rounded-xl border border-border bg-card space-y-4",
                className,
            )}
        >
            <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-3.5 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </div>
            <SkeletonText lines={3} />
            <div className="flex gap-2">
                <Skeleton className="h-7 w-16 rounded-md" />
                <Skeleton className="h-7 w-20 rounded-md" />
            </div>
        </div>
    );
}

/* ── Project list item ───────────────────────────────────────────────────── */

function SkeletonProjectRow({ className }: { className?: string }) {
    return (
        <div
            data-slot="skeleton-project-row"
            className={cn(
                "flex items-start justify-between gap-4 px-5 py-4",
                className,
            )}
        >
            <div className="space-y-2 flex-1">
                <div className="flex gap-2">
                    <Skeleton className="h-4 w-14 rounded-full" />
                    <Skeleton className="h-4 w-12 rounded-full" />
                </div>
                <Skeleton className="h-3.5 w-4/5" />
                <div className="flex gap-3">
                    <Skeleton className="h-3 w-14" />
                    <Skeleton className="h-3 w-18" />
                </div>
            </div>
            <div className="shrink-0 space-y-2 text-right">
                <Skeleton className="h-4 w-24 ml-auto" />
                <div className="flex gap-1 justify-end">
                    <Skeleton className="h-4 w-10 rounded-sm" />
                    <Skeleton className="h-4 w-12 rounded-sm" />
                </div>
            </div>
        </div>
    );
}

/* ── Stat block ──────────────────────────────────────────────────────────── */

function SkeletonStat({ className }: { className?: string }) {
    return (
        <div
            data-slot="skeleton-stat"
            className={cn("py-8 px-6 text-center space-y-2", className)}
        >
            <Skeleton className="h-9 w-24 mx-auto" />
            <Skeleton className="h-3 w-16 mx-auto" />
        </div>
    );
}

/* ── Avatar row ──────────────────────────────────────────────────────────── */

function SkeletonProfile({ className }: { className?: string }) {
    return (
        <div
            data-slot="skeleton-profile"
            className={cn("flex items-center gap-3", className)}
        >
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-2.5 w-36" />
            </div>
        </div>
    );
}

export {
    Skeleton,
    SkeletonText,
    SkeletonCard,
    SkeletonProjectRow,
    SkeletonStat,
    SkeletonProfile,
};
