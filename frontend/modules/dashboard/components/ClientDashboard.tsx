import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Briefcase, DollarSign, GitBranch, PlusCircle, FileText } from "lucide-react";
import { Button } from "@/modules/shared/components/button";
import { StatCard } from "@/modules/shared/components/stat-card";
import { Alert } from "@/modules/shared/components/alert";
import { getClientDashboard } from "../services/dashboard.server";
import { ServerFetchError } from "@/modules/shared/lib/server-fetch";
import { DashboardWelcomeHeader } from "./DashboardWelcomeHeader";
import { ClientProjectsList } from "./ClientProjectsList";
import { ClientActiveContracts } from "./ClientActiveContracts";
import { formatCurrency } from "@/modules/shared";
import { ClientDashboardResponse } from "../types";

export async function ClientDashboard() {
    let dashboard: ClientDashboardResponse;

    try {
        dashboard = await getClientDashboard();
    } catch (e) {
        if (e instanceof ServerFetchError && (e.status === 401 || e.status === 403)) {
            redirect("/login");
        }
        return <Alert variant="destructive">Failed to load dashboard. Please refresh.</Alert>;
    }

    const { stats, recentProjects, activeContracts } = dashboard;

    const subtitle = `${stats.openProjectsCount} open ${stats.openProjectsCount === 1 ? "project" : "projects"}, ${stats.totalBidsReceived} total bids received.`;

    return (
        <div className="space-y-6">
            <DashboardWelcomeHeader
                subtitle={subtitle}
                action={
                    <Link href="/client/projects/create">
                        <Button variant="outline">
                            <PlusCircle className="w-3.5 h-3.5" />
                            Post Project
                        </Button>
                    </Link>
                }
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                    label="Total Bids Received"
                    value={stats.totalBidsReceived}
                    icon={<GitBranch className="w-4 h-4" />}
                />
                <StatCard
                    label="Total Spent"
                    value={formatCurrency(stats.totalSpent)}
                    icon={<DollarSign className="w-4 h-4" />}
                />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold text-foreground">My Projects</h2>
                        <Link href="/client/projects" className="text-sm text-primary font-semibold hover:underline flex items-center gap-1">
                            View all <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                    <ClientProjectsList projects={recentProjects} />
                </div>

                <div className="space-y-4">
                    <ClientActiveContracts contracts={activeContracts} />
                </div>
            </div>
        </div>
    );
}