"use client";
import { useMemo, useState } from "react";
import { Users, AlertCircle } from "lucide-react";

import { ClientBidCard } from "../../bid/components/ClientBidCard";
import { useProjectBids } from "../../bid/hooks/useClientBids";
import { Skeleton } from "@/modules/shared/components/skeleton";
import { EmptyState } from "@/modules/shared/components/empty-state";
import { Pagination } from "../../shared/components/Pagination";

const PAGE_SIZE = 10;

interface ClientProjectBidsPanelProps {
    projectId: string;
}

export function ClientProjectBidsPanel({
    projectId,
}: ClientProjectBidsPanelProps) {
    const [page, setPage] = useState(0);

    const filters = useMemo(() => ({ page, size: PAGE_SIZE }), [page]);
    const { data, isLoading, error } = useProjectBids(projectId, filters);

    console.log("Bids data:", data, "Loading:", isLoading, "Error:", error);

    const bids = data?.content ?? [];
    const totalPages = data?.totalPages ?? 0;
    const totalElements = data?.totalElements ?? 0;

    /* if (error) return <ErrorState />; */

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    Proposals Received
                </h2>
                {!isLoading && (
                    <span className="text-sm text-muted-foreground">
                        {totalElements} proposal{totalElements !== 1 ? "s" : ""}
                    </span>
                )}
            </div>

            {/* List */}
            {isLoading ? (
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-36 rounded-xl" />
                    ))}
                </div>
            ) : bids.length === 0 ? (
                <EmptyState
                    icon={<AlertCircle className="w-5 h-5" />}
                    title="No proposals yet"
                    description="Once freelancers submit proposals, they'll appear here."
                />
            ) : (
                <div className="space-y-3">
                    {bids.map((bid) => (
                        <ClientBidCard
                            key={bid.id}
                            bid={bid}
                            projectId={projectId}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            )}
        </div>
    );
}
