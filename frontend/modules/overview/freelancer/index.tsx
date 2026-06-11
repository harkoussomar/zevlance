import Link from "next/link";
import { redirect } from "next/navigation";
import {
    ArrowRight,
    Briefcase,
    DollarSign,
    GitBranch,
    Star,
    FileText,
} from "lucide-react";
import { Button } from "@/modules/shared/components/button";
import { StatCard } from "@/modules/shared/components/stat-card";
import { Alert } from "@/modules/shared/components/alert";
import { ServerFetchError } from "@/modules/shared/lib/bff/server-fetch";
import { formatCurrency } from "@/modules/shared";
import { ActiveContracts } from "@/modules/shared/components/ActiveContracts";
import { RecentBids } from "./components/RecentBids";
import { LatestReviews } from "./components/LatestReviews";
import type { FreelancerOverviewResponse } from "./types/overview.freelancer";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { getFreelancerOverview } from "./api/overview.server.api";

export async function FreelancerOverview() {
    let dashboard: FreelancerOverviewResponse;

    try {
        dashboard = await getFreelancerOverview();
    } catch (e) {
        if (
            e instanceof ServerFetchError &&
            (e.status === 401 || e.status === 403)
        ) {
            redirect("/login");
        }
        return (
            <Alert variant="destructive">
                Failed to load dashboard. Please refresh.
            </Alert>
        );
    }

    const { user, stats, activeContracts, recentBids, latestReviews } =
        dashboard;

    const subtitle = `${stats.activeContractsCount} active ${stats.activeContractsCount === 1 ? "contract" : "contracts"}, ${stats.pendingBidsCount} pending ${stats.pendingBidsCount === 1 ? "bid" : "bids"}.`;

    return (
        <div className="space-y-7">
            {/* Welcome header */}
            <PageHeader
                name={user.name}
                subtitle={subtitle}
                showStatusDot
                action={
                    <Link href="/projects">
                        <Button variant="outline" className="gap-1.5 shadow-sm">
                            <Briefcase className="w-3.5 h-3.5" />
                            Find Work
                        </Button>
                    </Link>
                }
            />

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard
                    label="Total Earned"
                    value={formatCurrency(stats.totalEarned)}
                    icon={<DollarSign className="w-4 h-4" />}
                />
                <StatCard
                    label="Active Contracts"
                    value={stats.activeContractsCount}
                    icon={<FileText className="w-4 h-4" />}
                />
                <StatCard
                    label="Pending Bids"
                    value={stats.pendingBidsCount}
                    icon={<GitBranch className="w-4 h-4" />}
                />
                <StatCard
                    label="Avg Rating"
                    value={
                        stats.avgRating != null
                            ? stats.avgRating.toFixed(1)
                            : "—"
                    }
                    icon={<Star className="w-4 h-4" />}
                    trend={
                        stats.reviewCount > 0
                            ? {
                                  value: `${stats.reviewCount} reviews`,
                                  positive: true,
                              }
                            : undefined
                    }
                />
            </div>

            {/* Main content */}
            <div className="grid lg:grid-cols-3 gap-5">
                {/* Active contracts — wide column */}
                <div className="lg:col-span-2 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold text-foreground">
                                Active Contracts
                            </h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Your ongoing work
                            </p>
                        </div>
                        <Link
                            href="/freelancer/contracts"
                            className="text-sm text-primary font-semibold hover:underline flex items-center gap-1 transition-colors"
                        >
                            View all <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                    <ActiveContracts
                        role="freelancer"
                        contracts={activeContracts}
                    />
                </div>

                {/* Sidebar — bids + reviews */}
                <div className="space-y-4">
                    <RecentBids bids={recentBids} />
                    <LatestReviews reviews={latestReviews} />
                </div>
            </div>
        </div>
    );
}
