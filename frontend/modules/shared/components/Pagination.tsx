"use client";

import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react";
import { cn } from "@/modules/shared";
import { Button } from "@/modules/shared/components/button";

// ─── Primitives ───────────────────────────────────────────────────────────────

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
    return (
        <nav
            role="navigation"
            aria-label="pagination"
            data-slot="pagination"
            className={cn("mx-auto flex w-full justify-center", className)}
            {...props}
        />
    );
}

function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
    return (
        <ul
            data-slot="pagination-content"
            className={cn("flex items-center gap-1", className)}
            {...props}
        />
    );
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
    return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
    isActive?: boolean;
    href?: string;
} & Pick<React.ComponentProps<typeof Button>, "size"> &
    Omit<React.ComponentProps<"button">, "ref">;

function PaginationLink({
    className,
    isActive,
    size = "icon",
    onClick,
    ...props
}: PaginationLinkProps) {
    return (
        <Button
            variant="ghost"
            size={size}
            aria-current={isActive ? "page" : undefined}
            data-slot="pagination-link"
            data-active={isActive}
            onClick={onClick}
            className={cn(
                // base
                "relative h-8 w-8 rounded-lg text-xs font-semibold transition-all duration-150",
                "text-muted-foreground hover:text-foreground",
                "hover:bg-muted/70",
                // active page
                isActive && [
                    "bg-primary text-primary-foreground font-bold",
                    "hover:bg-primary/90 hover:text-primary-foreground",
                    "shadow-sm shadow-primary/20",
                    // subtle top highlight
                    "before:absolute before:inset-x-2 before:top-px before:h-px",
                    "before:rounded-full before:bg-white/30",
                ],
                className,
            )}
            {...props}
        />
    );
}

function PaginationPrevious({
    className,
    text = "Prev",
    ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
    return (
        <PaginationLink
            aria-label="Go to previous page"
            size="default"
            className={cn(
                "w-auto px-3 gap-1.5 text-xs font-semibold",
                "border border-border/60 bg-background hover:bg-muted/60",
                "rounded-lg shadow-xs",
                className,
            )}
            {...props}
        >
            <span className="inline-flex items-center gap-1.5">
                <ChevronLeftIcon className="w-3.5 h-3.5" />
                {text && <span className="hidden sm:block">{text}</span>}
            </span>
        </PaginationLink>
    );
}

function PaginationNext({
    className,
    text = "Next",
    ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
    return (
        <PaginationLink
            aria-label="Go to next page"
            size="default"
            className={cn(
                "w-auto px-3 gap-1.5 text-xs font-semibold",
                "border border-border/60 bg-background hover:bg-muted/60",
                "rounded-lg shadow-xs",
                className,
            )}
            {...props}
        >
            <span className="inline-flex items-center gap-1.5">
                {text && <span className="hidden sm:block">{text}</span>}
                <ChevronRightIcon className="w-3.5 h-3.5" />
            </span>
        </PaginationLink>
    );
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<"span">) {
    return (
        <span
            aria-hidden
            data-slot="pagination-ellipsis"
            className={cn(
                "flex size-8 items-center justify-center",
                "text-muted-foreground/50 text-xs tracking-widest select-none",
                className,
            )}
            {...props}
        >
            <MoreHorizontalIcon className="w-3.5 h-3.5" />
            <span className="sr-only">More pages</span>
        </span>
    );
}

// ─── Smart Pagination ─────────────────────────────────────────────────────────

export interface SmartPaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    siblingCount?: number;
    showLabels?: boolean;
    className?: string;
}

type PageEntry = number | "…";

function buildPageEntries(page: number, totalPages: number, siblingCount: number): PageEntry[] {
    const threshold = 2 * siblingCount + 5;
    if (totalPages <= threshold) {
        return Array.from({ length: totalPages }, (_, i) => i);
    }
    const left  = Math.max(1, page - siblingCount);
    const right = Math.min(totalPages - 2, page + siblingCount);
    const entries: PageEntry[] = [0];
    if (left > 1)               entries.push("…");
    for (let i = left; i <= right; i++) entries.push(i);
    if (right < totalPages - 2) entries.push("…");
    entries.push(totalPages - 1);
    return entries;
}

function SmartPagination({
    page,
    totalPages,
    onPageChange,
    siblingCount = 1,
    showLabels = true,
    className,
}: SmartPaginationProps) {
    if (totalPages <= 1) return null;

    const entries   = buildPageEntries(page, totalPages, siblingCount);
    const canGoPrev = page > 0;
    const canGoNext = page < totalPages - 1;

    return (
        <Pagination className={className}>
            {/* page counter hint */}
            <div className="flex items-center gap-3">
                <span className="hidden sm:block text-xs text-muted-foreground/60 font-medium tabular-nums select-none">
                    {page + 1} / {totalPages}
                </span>

                <PaginationContent>
                    {/* ── Prev ── */}
                    <PaginationItem>
                        <PaginationPrevious
                            text={showLabels ? "Prev" : ""}
                            aria-disabled={!canGoPrev}
                            onClick={(e) => { e.preventDefault(); if (canGoPrev) onPageChange(page - 1); }}
                            className={!canGoPrev ? "pointer-events-none opacity-40" : ""}
                        />
                    </PaginationItem>

                    {/* ── separator ── */}
                    <li aria-hidden className="w-px h-4 bg-border/60 mx-0.5 self-center" />

                    {/* ── Pages ── */}
                    {entries.map((entry, idx) =>
                        entry === "…" ? (
                            <PaginationItem key={`ellipsis-${idx}`}>
                                <PaginationEllipsis />
                            </PaginationItem>
                        ) : (
                            <PaginationItem key={entry}>
                                <PaginationLink
                                    isActive={entry === page}
                                    onClick={(e) => { e.preventDefault(); onPageChange(entry); }}
                                    aria-label={`Page ${entry + 1}`}
                                    className="cursor-pointer"
                                >
                                    {entry + 1}
                                </PaginationLink>
                            </PaginationItem>
                        ),
                    )}

                    {/* ── separator ── */}
                    <li aria-hidden className="w-px h-4 bg-border/60 mx-0.5 self-center" />

                    {/* ── Next ── */}
                    <PaginationItem>
                        <PaginationNext
                            text={showLabels ? "Next" : ""}
                            aria-disabled={!canGoNext}
                            onClick={(e) => { e.preventDefault(); if (canGoNext) onPageChange(page + 1); }}
                            className={!canGoNext ? "pointer-events-none opacity-40" : ""}
                        />
                    </PaginationItem>
                </PaginationContent>
            </div>
        </Pagination>
    );
}

export {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    SmartPagination,
};