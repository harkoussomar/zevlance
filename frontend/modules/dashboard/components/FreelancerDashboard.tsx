import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Briefcase, DollarSign, GitBranch, Star, FileText } from "lucide-react";
import { Button } from "@/modules/shared/components/button";
import { StatCard } from "@/modules/shared/components/stat-card";
import { Alert } from "@/modules/shared/components/alert";
import { getFreelancerDashboard } from "../services/dashboard.server";
import { ServerFetchError } from "@/modules/shared/lib/server-fetch";
import { DashboardWelcomeHeader } from "./DashboardWelcomeHeader";
import { FreelancerActiveContracts } from "./FreelancerActiveContracts";
import { FreelancerRecentBids } from "./FreelancerRecentBids";
import { FreelancerLatestReviews } from "./FreelancerLatestReviews";
import { formatCurrency } from "@/modules/shared";
import { FreelancerDashboardResponse } from "../types";

export async function FreelancerDashboard() {
    let dashboard: FreelancerDashboardResponse;

    try {
        dashboard = await getFreelancerDashboard();

    } catch (e) {
        if (e instanceof ServerFetchError && (e.status === 401 || e.status === 403)) {
            redirect("/login");
        }
        return <Alert variant="destructive">Failed to load dashboard. Please refresh.</Alert>;
    }

    const { stats, activeContracts, recentBids, latestReviews } = dashboard;

    const subtitle = `${stats.activeContractsCount} active ${stats.activeContractsCount === 1 ? "contract" : "contracts"}, ${stats.pendingBidsCount} pending bids.`;

    return (
        <div className="space-y-6">
            <DashboardWelcomeHeader
                subtitle={subtitle}
                action={
                    <Link href="/projects">
                        <Button size="sm">
                            <Briefcase className="w-3.5 h-3.5" />
                            Find Work
                        </Button>
                    </Link>
                }
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                    value={stats.avgRating != null ? stats.avgRating.toFixed(1) : "—"}
                    icon={<Star className="w-4 h-4" />}
                    trend={
                        stats.reviewCount > 0
                            ? { value: `${stats.reviewCount} reviews`, positive: true }
                            : undefined
                    }
                />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold text-foreground">Active Contracts</h2>
                        <Link href="/freelancer/contracts" className="text-sm text-primary font-semibold hover:underline flex items-center gap-1">
                            View all <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                    <FreelancerActiveContracts contracts={activeContracts} />
                </div>

                <div className="space-y-4">
                    <FreelancerRecentBids bids={recentBids} />
                    <FreelancerLatestReviews reviews={latestReviews} />
                </div>
            </div>
        </div>
    );
}