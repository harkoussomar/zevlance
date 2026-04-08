"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
    GitBranch,
    Briefcase,
    Send,
    DollarSign,
    TrendingUp,
} from "lucide-react";
import { cn, percentage } from "@/modules/shared";
import type { BidStatus } from "../types";
import { BidCard } from "./FreelancerBidCard";
import { useMyBids } from "../hooks/useFreelancerBids";
import { Skeleton } from "@/modules/shared/components/skeleton";
import { Button } from "@/modules/shared/components/button";
import { Card, CardContent } from "@/modules/shared/components/card";
import { StatCard } from "@/modules/shared/components/stat-card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/modules/shared/components/tabs";
import { EmptyState } from "@/modules/shared/components/empty-state";
import { formatCurrency } from "@/modules/shared";
import { STAT_CONFIGS } from "../config/stat-config";
import { TABS_CONFIG } from "../config/tabs-config";
import { Pagination } from "@/modules/shared/components/Pagination";

const PAGE_SIZE = 10;

export function FreelancerBidsPanel() {
    const [page, setPage] = useState(0);

    // Memoised so the object reference is stable across renders — prevents
    // useMyBids from refetching whenever an unrelated state update occurs.
    const filters = useMemo(() => ({ page, size: PAGE_SIZE }), [page]);

    const { data, isLoading, isError, error } = useMyBids(filters);

    const bids = useMemo(() => data?.content ?? [], [data?.content]);

    const totalPages = data?.totalPages ?? 0;
    const totalElements = data?.totalElements ?? 0;

    // Pre-group bids by status once per render instead of filtering inline
    // inside every TabsContent and stat card. With PAGE_SIZE=10 this is trivial
    // but it scales cleanly and avoids repeated .filter() calls in JSX.
    const bidsByStatus = useMemo(() => {
        const grouped: Record<BidStatus | "ALL", typeof bids> = {
            ALL: bids,
            PENDING: [],
            ACCEPTED: [],
            REJECTED: [],
            WITHDRAWN: [],
        };
        for (const bid of bids) {
            grouped[bid.status].push(bid);
        }
        return grouped;
    }, [bids]);

    // Stats derived from the current page.
    // NOTE: for accurate totals across all pages a dedicated /bids/summary
    // endpoint would be required — this gives a reasonable per-page view.
    const totalValue = bidsByStatus.ACCEPTED.reduce(
        (sum, b) => sum + b.proposedPrice,
        0,
    );

    const successRate = percentage(bidsByStatus.ACCEPTED.length, bids.length);

    if (isError) {
        return (
            <EmptyState
                icon={<GitBranch className="w-5 h-5" />}
                title="Could not load proposals"
                description={
                    error instanceof Error
                        ? error.message
                        : "Something went wrong. Please try again."
                }
                action={
                    <Button size="sm" onClick={() => setPage(0)}>
                        Retry
                    </Button>
                }
            />
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        My Proposals
                    </h1>
                    <div className="text-muted-foreground mt-1">
                        {isLoading ? (
                            <Skeleton className="h-4 w-32" />
                        ) : (
                            `${totalElements} total proposals submitted`
                        )}
                    </div>
                </div>
                <Link href="/projects">
                    <Button size="sm">
                        <Send className="w-3.5 h-3.5" />
                        Submit New Bid
                    </Button>
                </Link>
            </div>

            {/* Status counts */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {STAT_CONFIGS.map((stat) => {
                    const count = isLoading
                        ? null
                        : bidsByStatus[stat.status].length;
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
                                {isLoading ? (
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
                    value={isLoading ? "—" : formatCurrency(totalValue)}
                    icon={<DollarSign className="w-4 h-4" />}
                />
                <StatCard
                    label="Success Rate"
                    value={isLoading ? "—" : `${successRate}%`}
                    icon={<TrendingUp className="w-4 h-4" />}
                    trend={
                        !isLoading && successRate > 25
                            ? { value: "Above average", positive: true }
                            : undefined
                    }
                />
            </div>

            {/* Tabbed bid list */}
            <Tabs defaultValue="ALL">
                <TabsList>
                    {TABS_CONFIG.map((tab) => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            badge={
                                tab.value === "ALL"
                                    ? bids.length
                                    : tab.value === "PENDING"
                                      ? bidsByStatus.PENDING.length || undefined
                                      : undefined
                            }
                        >
                            {tab.icon}
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {TABS_CONFIG.map(({ value }) => {
                    const tabBids = bidsByStatus[value as BidStatus | "ALL"];

                    return (
                        <TabsContent key={value} value={value}>
                            {isLoading ? (
                                <div className="space-y-3">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <Skeleton
                                            key={i}
                                            className="h-36 rounded-xl"
                                        />
                                    ))}
                                </div>
                            ) : tabBids.length === 0 ? (
                                <EmptyState
                                    icon={<GitBranch className="w-5 h-5" />}
                                    title={
                                        value === "ALL"
                                            ? "No proposals yet"
                                            : `No ${value.toLowerCase()} proposals`
                                    }
                                    description={
                                        value === "ALL"
                                            ? "You haven't submitted any proposals yet."
                                            : `No proposals with status: ${value.toLowerCase()}.`
                                    }
                                    action={
                                        value === "ALL" ? (
                                            <Link href="/projects">
                                                <Button size="sm">
                                                    <Briefcase className="w-3.5 h-3.5" />
                                                    Browse Projects
                                                </Button>
                                            </Link>
                                        ) : undefined
                                    }
                                />
                            ) : (
                                <div className="space-y-3">
                                    {tabBids.map((bid) => (
                                        <BidCard key={bid.id} bid={bid} />
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    );
                })}
            </Tabs>

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
