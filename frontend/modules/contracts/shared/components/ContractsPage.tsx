"use client";

import { useState } from "react";
import {
    FileText,
    Clock,
    DollarSign,
    CheckCircle2,
    AlertCircle,
    XCircle,
    RefreshCcw,
} from "lucide-react";

import { Skeleton, SkeletonCard } from "@/modules/shared/components/skeleton";
import { StatCard } from "@/modules/shared/components/stat-card";
import { EmptyState } from "@/modules/shared/components/empty-state";
import { FilterTab, FilterTabs } from "@/modules/shared/components/FilterTabs";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { Button } from "@/modules/shared/components/button";
import { formatCurrency } from "@/modules/shared";

import { selectRole, useAuthStore } from "@/store/auth-store";
import { useMyContracts } from "../hooks/contract.shared.useMyContracts";
import { useMyContractsSummary } from "../hooks/contract.shared.useMyContractsSummary";
import { ContractCard } from "./ContractCard";
import type {
    ContractStatus,
    ContractSummaryResponse,
} from "../types/contract.shared";
import { SmartPagination } from "@/modules/shared/components/Pagination";

export type ContractTabValue = ContractStatus | "ALL";

const PAGE_SIZE = 10;

const CONTRACT_TABS_CONFIG: FilterTab<ContractTabValue>[] = [
    {
        label: "All Contracts",
        value: "ALL",
        icon: <FileText className="w-3.5 h-3.5" />,
    },
    {
        label: "Active",
        value: "ACTIVE",
        icon: <Clock className="w-3.5 h-3.5" />,
    },
    {
        label: "Completed",
        value: "COMPLETED",
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    {
        label: "Disputed",
        value: "DISPUTED",
        icon: <AlertCircle className="w-3.5 h-3.5" />,
    },
    {
        label: "Cancelled",
        value: "CANCELLED",
        icon: <XCircle className="w-3.5 h-3.5" />,
    },
];

// Helper to clean up the badge counting logic
function getBadgeCount(
    tabValue: ContractTabValue,
    summary?: ContractSummaryResponse,
): number | undefined {
    if (!summary) return undefined;
    const counts: Record<ContractTabValue, number> = {
        ALL: summary.totalContracts ?? 0,
        ACTIVE: summary.activeCount ?? 0,
        COMPLETED: summary.completedCount ?? 0,
        DISPUTED: summary.disputedCount ?? 0,
        CANCELLED: summary.cancelledCount ?? 0,
    };
    return counts[tabValue];
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. STATS COMPONENT
// Handles its own loading and error states separately from the list.
// ─────────────────────────────────────────────────────────────────────────────
function ContractsStats() {
    const role = useAuthStore(selectRole);
    const isClient = role === "CLIENT";

    const {
        data: summary,
        isPending,
        isError,
        refetch,
    } = useMyContractsSummary();

    if (isPending) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    // Renders 4 nice blank skeleton boxes
                    <Skeleton key={i} className="h-28 w-full rounded-xl" />
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    <p>Could not load contract statistics.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                    <RefreshCcw className="w-3.5 h-3.5 mr-2" /> Retry Stats
                </Button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                label="Active Contracts"
                value={summary?.activeCount ?? 0}
                icon={<Clock className="w-4 h-4" />}
            />
            <StatCard
                label="Active Value"
                value={formatCurrency(summary?.activeValue ?? 0)}
                icon={<DollarSign className="w-4 h-4" />}
            />
            <StatCard
                label="Completed Contracts"
                value={summary?.completedCount ?? 0}
                icon={<CheckCircle2 className="w-4 h-4" />}
            />
            <StatCard
                label={isClient ? "Total Spent" : "Total Earned"}
                value={formatCurrency(
                    isClient
                        ? (summary?.clientTotalReleased ?? 0)
                        : (summary?.freelancerTotalEarned ?? 0),
                )}
                icon={<DollarSign className="w-4 h-4" />}
                trend={{ value: "All released milestones", positive: true }}
            />
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. LIST COMPONENT
// Handles tabs, pagination, and list rendering. Fails independently.
// ─────────────────────────────────────────────────────────────────────────────
function ContractsList() {
    const [activeTab, setActiveTab] = useState<ContractTabValue>("ALL");
    const [page, setPage] = useState(0);

    // Fetch list data
    const {
        data: pageData,
        isPending: isListPending,
        isError: isListError,
        refetch: refetchList,
    } = useMyContracts({
        status: activeTab === "ALL" ? undefined : activeTab,
        page,
        size: PAGE_SIZE,
    });

    // Pull summary just to populate the badges on tabs.
    // React Query caches this so it won't trigger a second network call.
    const { data: summary } = useMyContractsSummary();

    const contracts = pageData?.content ?? [];
    const totalPages = pageData?.totalPages ?? 0;

    function handleTabChange(tab: ContractTabValue) {
        setActiveTab(tab);
        setPage(0);
    }

    const filterTabsData = CONTRACT_TABS_CONFIG.map((tab) => ({
        ...tab,
        badge: getBadgeCount(tab.value, summary),
    }));

    if (isListError) {
        return (
            <div className="pt-6">
                <EmptyState
                    preset="error"
                    title="Could not load contracts list"
                    description="Something went wrong while retrieving your contracts. Please try again."
                    action={
                        <Button variant="outline" onClick={() => refetchList()}>
                            <RefreshCcw className="w-4 h-4 mr-2" /> Retry List
                        </Button>
                    }
                />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <FilterTabs
                tabs={filterTabsData}
                value={activeTab}
                onValueChange={handleTabChange}
                className="max-w-fit"
            />

            <div className="mt-4">
                {isListPending ? (
                    <div className="grid md:grid-cols-2 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : contracts.length === 0 ? (
                    <EmptyState
                        icon={<FileText className="w-8 h-8" />}
                        title={`No ${activeTab === "ALL" ? "" : activeTab.toLowerCase()} contracts`}
                        description={
                            activeTab === "ALL"
                                ? "You haven't been part of any contracts yet."
                                : `You don't have any contracts with a status of ${activeTab.toLowerCase()}.`
                        }
                    />
                ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                        {contracts.map((contract) => (
                            <ContractCard
                                key={contract.id}
                                contract={contract}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
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

// ─────────────────────────────────────────────────────────────────────────────
// 3. ORCHESTRATOR
// Ties the header, stats, and list together.
// ─────────────────────────────────────────────────────────────────────────────

export function ContractsPage() {
    // We fetch the summary one more time just for the header subtitle.
    // React Query gracefully deduplicates this. If it fails, we fall back safely.
    const { data: summary, isPending, isError } = useMyContractsSummary();

    const getSubtitle = () => {
        if (isPending) {
            return <Skeleton className="h-4 w-48" />;
        }
        if (isError) {
            return undefined; // Hides the subtitle entirely so it doesn't show "0"
        }
        return `${summary?.totalContracts ?? 0} total contracts · ${summary?.activeCount ?? 0} active`;
    };

    return (
        <div className="space-y-6">
            <PageHeader title="Contracts" subtitle={getSubtitle()} />

            <ContractsStats />
            <ContractsList />
        </div>
    );
}
