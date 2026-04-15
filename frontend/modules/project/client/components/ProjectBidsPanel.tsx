"use client";

import { useMemo, useState } from "react";
import { Inbox, AlertTriangle } from "lucide-react";
import { SmartPagination } from "@/modules/shared/components/Pagination";
import { BidCard, useProjectBids } from "@/modules/bid/client";

const PAGE_SIZE = 10;

interface ProjectBidsPanelProps {
    projectId: string;
}

function BidsSkeleton() {
    return (
        <div className="space-y-px animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
                <div
                    key={i}
                    className="border border-border/40 rounded-md p-4 bg-muted/10 space-y-2"
                    style={{ opacity: 1 - i * 0.2 }}
                >
                    <div className="flex justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-muted" />
                            <div className="h-3.5 w-28 bg-muted rounded-sm" />
                        </div>
                        <div className="h-5 w-16 bg-muted rounded-sm" />
                    </div>
                    <div className="h-3 w-3/4 bg-muted/70 rounded-sm" />
                    <div className="flex gap-4">
                        <div className="h-3 w-16 bg-muted/50 rounded-sm" />
                        <div className="h-3 w-12 bg-muted/50 rounded-sm" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function EmptyBids() {
    return (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
            <svg
                width="36"
                height="36"
                viewBox="0 0 36 36"
                fill="none"
                className="text-muted-foreground/20"
            >
                <circle
                    cx="18"
                    cy="12"
                    r="7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                />
                <path
                    d="M4 30c0-7.732 6.268-14 14-14s14 6.268 14 14"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                />
                <circle
                    cx="28"
                    cy="26"
                    r="5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                />
                <path
                    d="M28 24v2.5l1.5 1.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            <div className="space-y-0.5">
                <p className="text-xs font-medium text-muted-foreground/60">
                    No proposals yet
                </p>
                <p className="font-mono text-[11px] text-muted-foreground/40">
                    Freelancers&apos; submissions will appear here
                </p>
            </div>
        </div>
    );
}

function ErrorBids() {
    return (
        <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
            <AlertTriangle className="w-4 h-4 text-destructive/40" />
            <p className="font-mono text-[11px] text-muted-foreground/50">
                Failed to load proposals
            </p>
        </div>
    );
}

export function ProjectBidsPanel({ projectId }: ProjectBidsPanelProps) {
    const [page, setPage] = useState(0);
    const filters = useMemo(() => ({ page, size: PAGE_SIZE }), [page]);
    const { data, isLoading, error } = useProjectBids(projectId, filters);

    const bids = data?.content ?? [];
    const totalPages = data?.totalPages ?? 0;
    const totalElements = data?.totalElements ?? 0;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-baseline justify-between gap-2">
                <div className="flex items-center gap-2">
                    <Inbox className="w-3.5 h-3.5 text-muted-foreground/50" />
                    <h2 className="font-display text-sm font-bold text-foreground tracking-tight">
                        Proposals
                    </h2>
                </div>
                {!isLoading && !error && (
                    <span className="font-mono text-[11px] text-muted-foreground/50 tabular-nums">
                        {totalElements}
                    </span>
                )}
            </div>

            {/* Content */}
            {error ? (
                <ErrorBids />
            ) : isLoading ? (
                <BidsSkeleton />
            ) : bids.length === 0 ? (
                <EmptyBids />
            ) : (
                <div className="space-y-2">
                    {bids.map((bid) => (
                        <BidCard key={bid.id} bid={bid} projectId={projectId} />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <SmartPagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            )}
        </div>
    );
}
