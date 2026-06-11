"use client";

import { useState } from "react";
import Link from "next/link";
import { DollarSign, Send, TrendingUp } from "lucide-react";
import { cn, formatCurrency } from "@/modules/shared";
import { BidCard } from "./BidCard";
import { Skeleton } from "@/modules/shared/components/skeleton";
import { Button } from "@/modules/shared/components/button";
import { Card, CardContent } from "@/modules/shared/components/card";
import { StatCard } from "@/modules/shared/components/stat-card";
import { EmptyState } from "@/modules/shared/components/empty-state";
import { STAT_CONFIGS } from "../config/stat-config";
import { TABS_CONFIG } from "../config/tabs-config";
import { SmartPagination } from "@/modules/shared/components/Pagination";
import { FilterTabs } from "@/modules/shared/components/FilterTabs";
import { useMyBids } from "../hooks/bid.freelancer.useMyBids";
import { useMyBidsSummary } from "../hooks/bid.freelancer.useMyBidsSummary";
import type { BidStatus } from "../../shared";
import { PageHeader } from "@/modules/shared/components/PageHeader";

// ─────────────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

export function BidsPanel() {
    const [page, setPage] = useState(0);
    const [activeTab, setActiveTab] = useState<BidStatus | "ALL">("ALL");

    // ── data ──────────────────────────────────────────────────────────────────

    const { data, isLoading, isError, error, refetch } = useMyBids({
        page,
        size: PAGE_SIZE,
        status: activeTab === "ALL" ? undefined : activeTab,
    });

    const { summary, isLoading: isSummaryLoading } = useMyBidsSummary();

    const bids = data?.content ?? [];
    const totalPages = data?.totalPages ?? 0;
    const totalElements = data?.totalElements ?? 0;

    // ── handlers ──────────────────────────────────────────────────────────────

    function handleTabChange(tab: BidStatus | "ALL") {
        setActiveTab(tab);
        setPage(0);
    }

    // ── derived tab config ────────────────────────────────────────────────────

    const filterTabsData = TABS_CONFIG.map((tab) => {
        const pending = summary?.pending || 0;
        const accepted = summary?.accepted || 0;
        const rejected = summary?.rejected || 0;
        const withdrawn = summary?.withdrawn || 0;

        const allCount = pending + accepted + rejected + withdrawn;
        const specificCount =
            summary?.[tab.value.toLowerCase() as keyof typeof summary] || 0;

        return {
            value: tab.value as BidStatus | "ALL",
            icon: tab.icon,
            label: tab.label,
            badge: tab.value === "ALL" ? allCount : (specificCount as number),
        };
    });

    // ── early return ──────────────────────────────────────────────────────────

    if (isError) {
        return (
            <EmptyState
                preset="error"
                title="Could not load proposals"
                description={error instanceof Error ? error.message : undefined}
                action={
                    <Button size="sm" onClick={() => refetch()}>
                        Retry
                    </Button>
                }
            />
        );
    }

    // ── render ────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-6">
            {/* Header */}
            <PageHeader
                title="My Proposals"
                subtitle={
                    isLoading ? (
                        <Skeleton className="h-4 w-32" />
                    ) : (
                        `${totalElements} proposal${totalElements !== 1 ? "s" : ""} in this view`
                    )
                }
                action={
                    <Link href="/projects">
                        <Button variant="outline">
                            <Send className="w-3.5 h-3.5" />
                            Submit New Bid
                        </Button>
                    </Link>
                }
            />

            {/* Status counts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {STAT_CONFIGS.map((stat) => {
                    const count = isSummaryLoading
                        ? null
                        : summary[
                              stat.status.toLowerCase() as keyof typeof summary
                          ];
                    return (
                        <Card
                            key={stat.status}
                            className="hover:border-primary/30 hover:shadow-md transition-all"
                        >
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        {stat.label}
                                    </span>
                                    <div
                                        className={cn(
                                            "p-2 rounded-lg",
                                            stat.bg,
                                            stat.color,
                                        )}
                                    >
                                        {stat.icon}
                                    </div>
                                </div>
                                {isSummaryLoading ? (
                                    <Skeleton className="h-8 w-10" />
                                ) : (
                                    <div className="text-2xl font-bold text-foreground">
                                        {count}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Quick insights */}
            <div className="grid sm:grid-cols-2 gap-4">
                <StatCard
                    label="Contract Value (Accepted Bids)"
                    value={
                        isSummaryLoading
                            ? "—"
                            : formatCurrency(summary.totalValue)
                    }
                    icon={<DollarSign className="w-4 h-4" />}
                />
                <StatCard
                    label="Success Rate"
                    value={isSummaryLoading ? "—" : `${summary.successRate}%`}
                    icon={<TrendingUp className="w-4 h-4" />}
                    trend={
                        !isSummaryLoading && summary.successRate > 25
                            ? { value: "Above average", positive: true }
                            : undefined
                    }
                />
            </div>

            {/* Tabbed bid list */}
            <div className="space-y-4">
                <FilterTabs
                    tabs={filterTabsData}
                    value={activeTab}
                    onValueChange={handleTabChange}
                    className="max-w-fit"
                />

                <div className="mt-4">
                    {isLoading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Skeleton key={i} className="h-36 rounded-xl" />
                            ))}
                        </div>
                    ) : bids.length === 0 ? (
                        activeTab === "ALL" ? (
                            <EmptyState
                                preset="empty"
                                title="No proposals yet"
                                description="You haven't submitted any proposals yet."
                                action={
                                    <Link href="/projects">
                                        <Button size="sm">
                                            Browse Projects
                                        </Button>
                                    </Link>
                                }
                            />
                        ) : (
                            <EmptyState
                                preset="no-results"
                                title={`No ${activeTab.toLowerCase()} proposals`}
                                description={`You have no proposals with status: ${activeTab.toLowerCase()}.`}
                            />
                        )
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {bids.map((bid) => (
                                <BidCard key={bid.id} bid={bid} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

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
