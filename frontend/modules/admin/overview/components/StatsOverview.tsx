"use client";

import {
    AlertCircle,
    Users,
    Briefcase,
    Star,
    Ban,
    FolderOpen,
    CheckCircle2,
    FileText,
    Flag,
    DollarSign,
    Activity,
    AlertTriangle,
    Award
} from "lucide-react";
import { RevenueChart } from "./RevenueChart";
import { UserGrowthChart } from "./UserGrowthChart";
import { FlaggedProjectsPanel } from "./FlaggedProjectsPanel";
import { RecentAuditLogPanel } from "./RecentAuditLogPanel";
import { useAdminStats } from "../hooks/useAdminOverview";
import { StatCard } from "@/modules/shared/components/stat-card";

// ── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2 pt-2">
            <span className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
                {children}
            </span>
            <div className="flex-1 h-px bg-border" />
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

export function StatsOverview() {
    const { data, isLoading, isError } = useAdminStats();

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-24 bg-muted/50 rounded-xl" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="h-72 bg-muted/50 rounded-xl" />
                    <div className="h-72 bg-muted/50 rounded-xl" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="h-64 bg-muted/50 rounded-xl" />
                    <div className="h-64 bg-muted/50 rounded-xl" />
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-8 flex items-center justify-center gap-2 text-destructive">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="text-sm">Failed to load platform stats. Please refresh the page.</span>
            </div>
        );
    }

    if (!data) return null;

    const freelancerPct = data.totalUsers > 0
        ? Math.round((data.totalFreelancers / data.totalUsers) * 100)
        : 0;

    return (
        <div className="space-y-5">

            {/* ── Section 1: User metrics ───────────────────────────────────── */}
            <SectionLabel>Users</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard
                    label="Total users"
                    value={data.totalUsers.toLocaleString()}
                    icon={<Users className="w-5 h-5" />}
                    trend={{
                        value: `${freelancerPct}% freelancers`,
                        positive: true
                    }}
                />
                <StatCard
                    label="Freelancers"
                    value={data.totalFreelancers.toLocaleString()}
                    icon={<Briefcase className="w-5 h-5" />}
                    trend={{
                        value: `${data.totalClients.toLocaleString()} clients`,
                        positive: true
                    }}
                />
                <StatCard
                    label="Avg rating"
                    value={data.averageRating.toFixed(1)}
                    icon={<Star className="w-5 h-5" />}
                    trend={{
                        value: `From ${data.totalReviews.toLocaleString()} reviews`,
                        positive: data.averageRating >= 4.0
                    }}
                />
                <StatCard
                    label="Suspended users"
                    value={data.suspendedUsers}
                    icon={<Ban className="w-5 h-5" />}
                    trend={{
                        value: data.suspendedUsers > 0 ? "Requires attention" : "Clean platform",
                        positive: data.suspendedUsers === 0
                    }}
                />
            </div>

            {/* ── Section 2: Project & contract metrics ────────────────────── */}
            <SectionLabel>Projects &amp; contracts</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard
                    label="Total projects"
                    value={data.totalProjects.toLocaleString()}
                    icon={<FolderOpen className="w-5 h-5" />}
                    trend={{
                        value: `${data.openProjects} open · ${data.inProgressProjects} active`,
                        positive: true
                    }}
                />
                <StatCard
                    label="Completed projects"
                    value={data.completedProjects.toLocaleString()}
                    icon={<CheckCircle2 className="w-5 h-5" />}
                    trend={{
                        value: "All time completions",
                        positive: true
                    }}
                />
                <StatCard
                    label="Active contracts"
                    value={data.activeContracts}
                    icon={<FileText className="w-5 h-5" />}
                    trend={{
                        value: data.pendingDisputes > 0 
                            ? `${data.pendingDisputes} active disputes` 
                            : `of ${data.totalContracts.toLocaleString()} total`,
                        positive: data.pendingDisputes === 0
                    }}
                />
                <StatCard
                    label="Flagged projects"
                    value={data.flaggedProjects}
                    icon={<Flag className="w-5 h-5" />}
                    trend={{
                        value: data.flaggedProjects > 0 ? "Needs review" : "All clear",
                        positive: data.flaggedProjects === 0
                    }}
                />
            </div>

            {/* ── Section 3: Revenue ───────────────────────────────────────── */}
            <SectionLabel>Revenue</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                <StatCard
                    label="Total volume"
                    value={`$${(data.revenueVolume || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    icon={<DollarSign className="w-5 h-5" />}
                    trend={{
                        value: "All-time released gross",
                        positive: true
                    }}
                />
                <StatCard
                    label="System status"
                    value={data.pendingDisputes > 0 ? "Under review" : "Optimal"}
                    icon={
                        data.pendingDisputes > 0 
                            ? <AlertTriangle className="w-5 h-5" /> 
                            : <Activity className="w-5 h-5" />
                    }
                    trend={{
                        value: data.pendingDisputes > 0 
                            ? `${data.pendingDisputes} unresolved disputes` 
                            : "All systems operational",
                        positive: data.pendingDisputes === 0
                    }}
                />
                <StatCard
                    label="Completed contracts"
                    value={data.completedContracts.toLocaleString()}
                    icon={<Award className="w-5 h-5" />}
                    trend={{
                        value: "Lifetime completed",
                        positive: true
                    }}
                />
            </div>

            {/* ── Section 4: Charts ────────────────────────────────────────── */}
            <SectionLabel>Trends — last 30 days</SectionLabel>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <RevenueChart data={data.revenueOverTime} />
                <UserGrowthChart data={data.userGrowthOverTime} />
            </div>

            {/* ── Section 5: Flagged + Audit log ───────────────────────────── */}
            <SectionLabel>Attention required</SectionLabel>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <FlaggedProjectsPanel />
                <RecentAuditLogPanel />
            </div>

        </div>
    );
}