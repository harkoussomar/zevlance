import Link from "next/link";
import { redirect } from "next/navigation";
import {
    ArrowRight,
    Briefcase,
    DollarSign,
    GitBranch,
    PlusCircle,
    FileText,
} from "lucide-react";
import { Button } from "@/modules/shared/components/button";
import { StatCard } from "@/modules/shared/components/stat-card";
import { Alert } from "@/modules/shared/components/alert";
import { ServerFetchError } from "@/modules/shared/lib/server-fetch";
import { formatCurrency } from "@/modules/shared";
import { ActiveContracts } from "@/modules/shared/components/ActiveContracts";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { ProjectsList } from "./components/ProjectsList";
import { getClientOverview } from "./services/overview.server";
import type { ClientOverviewResponse } from "./types/overview.client";

export async function ClientOverview() {
    let dashboard: ClientOverviewResponse;

    try {
        dashboard = await getClientOverview();
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

    const { user,stats, recentProjects, activeContracts } = dashboard;

    const subtitle = `${stats.openProjectsCount} open ${stats.openProjectsCount === 1 ? "project" : "projects"}, ${stats.totalBidsReceived} total bids received.`;

    return (
        <div className="space-y-7">
            {/* Welcome header */}
            <PageHeader
                name={user.name}
                subtitle={subtitle}
                showStatusDot
                action={
                    <Link href="/client/projects/create">
                        <Button variant="outline" className="gap-1.5 shadow-sm">
                            <PlusCircle className="w-3.5 h-3.5" />
                            Post Project
                        </Button>
                    </Link>
                }
            />

            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard
                    label="Open Projects"
                    value={stats.openProjectsCount}
                    icon={<Briefcase className="w-4 h-4" />}
                />
                <StatCard
                    label="Active Contracts"
                    value={stats.activeContractsCount}
                    icon={<FileText className="w-4 h-4" />}
                />
                <StatCard
                    label="Bids Received"
                    value={stats.totalBidsReceived}
                    icon={<GitBranch className="w-4 h-4" />}
                />
                <StatCard
                    label="Total Spent"
                    value={formatCurrency(stats.totalSpent)}
                    icon={<DollarSign className="w-4 h-4" />}
                />
            </div>

            {/* Main content */}
            <div className="flex flex-wrap gap-5">
                {/* Projects — wide column */}
                <div className="flex-2 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold text-foreground">
                                My Projects
                            </h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Recently posted
                            </p>
                        </div>
                        <Link
                            href="/client/projects"
                            className="text-sm text-primary font-semibold hover:underline flex items-center gap-1 transition-colors"
                        >
                            View all <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                    <ProjectsList projects={recentProjects} />
                </div>

                <div className="flex-1 space-y-3">
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
                        role="client"
                        contracts={activeContracts}
                    />
                </div>
            </div>
        </div>
    );
}
