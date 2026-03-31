"use client";

import Link from "next/link";
import {
    ArrowRight,
    Briefcase,
    DollarSign,
    GitBranch,
    Clock,
    FileText,
    PlusCircle,
} from "lucide-react";
/* import {
    useCurrentUser,
} from "@/store/auth-store"; */
import {
    MOCK_CONTRACTS,
    MOCK_MY_PROJECTS,
    MOCK_MILESTONES,
} from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
    StatCard,
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    Button,
    Avatar,
} from "@/components/ui";
import {
    ProjectStatusBadge,
} from "@/components/shared/status-badge";


export default function ClientDashboard() {
    /* const user = useCurrentUser(); */
    const openProjects = MOCK_MY_PROJECTS.filter((p) => p.status === "OPEN");
  /*const inProgress = MOCK_MY_PROJECTS.filter(
        (p) => p.status === "IN_PROGRESS",
    ); */
    const totalBids = MOCK_MY_PROJECTS.reduce((s, p) => s + p.bidCount, 0);
    const activeContracts = MOCK_CONTRACTS.filter((c) => c.status === "ACTIVE");
    const totalSpent = MOCK_CONTRACTS.filter(
        (c) => c.status === "COMPLETED",
    ).reduce((s, c) => s + c.agreedPrice, 0);

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div className="flex items-start justify-between">
                <div>
{/*                     <h1 className="text-2xl font-bold text-foreground">
                        Welcome back, {user?.name?.split(" ")[0]} 👋
                    </h1> */}
                    <p className="text-muted-foreground mt-1">
                        {openProjects.length} open projects, {totalBids} total
                        bids received.
                    </p>
                </div>
                <Link href="/projects/create">
                    <Button size="sm">
                        <PlusCircle className="w-3.5 h-3.5" />
                        Post Project
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Open Projects"
                    value={openProjects.length}
                    icon={<Briefcase className="w-4 h-4" />}
                />
                <StatCard
                    label="Active Contracts"
                    value={activeContracts.length}
                    icon={<FileText className="w-4 h-4" />}
                />
                <StatCard
                    label="Total Bids Received"
                    value={totalBids}
                    icon={<GitBranch className="w-4 h-4" />}
                    trend={{ value: "+5 this week", positive: true }}
                />
                <StatCard
                    label="Total Spent"
                    value={formatCurrency(totalSpent)}
                    icon={<DollarSign className="w-4 h-4" />}
                />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* My projects */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold text-foreground">
                            My Projects
                        </h2>
                        <Link
                            href="/my-projects"
                            className="text-sm text-primary font-semibold hover:underline flex items-center gap-1"
                        >
                            View all <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {MOCK_MY_PROJECTS.slice(0, 4).map((project) => (
                        <Card
                            key={project.id}
                            className="hover:border-primary/30 hover:shadow-md transition-all duration-200"
                        >
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <Link
                                            href={`/projects/${project.id}`}
                                            className="font-bold text-foreground hover:text-primary transition-colors line-clamp-1"
                                        >
                                            {project.title}
                                        </Link>
                                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <GitBranch className="w-3 h-3" />
                                                {project.bidCount} bids
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                Due{" "}
                                                {formatDate(project.deadline)}
                                            </span>
                                        </div>
                                        <div className="flex gap-1.5 mt-2 flex-wrap">
                                            {project.requiredSkills
                                                .slice(0, 3)
                                                .map((skill) => (
                                                    <span
                                                        key={skill}
                                                        className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0 space-y-1">
                                        <p className="text-sm font-bold text-foreground">
                                            ${project.budgetMin / 1000}K–$
                                            {project.budgetMax / 1000}K
                                        </p>
                                        <ProjectStatusBadge
                                            status={project.status}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Right: active contracts + quick actions */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Active Contracts</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 px-0 pb-0">
                            {activeContracts.map((contract) => {
                                const milestones = MOCK_MILESTONES.filter(
                                    (m) => m.contractId === contract.id,
                                );
                                const approved = milestones.filter(
                                    (m) => m.status === "APPROVED",
                                ).length;
                                return (
                                    <Link
                                        key={contract.id}
                                        href={`/contracts/${contract.id}`}
                                        className="flex items-center gap-3 px-5 py-3 border-b border-border last:border-b-0 hover:bg-muted/40 transition-colors"
                                    >
                                        <Avatar
                                            name={contract.freelancerName}
                                            size="sm"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-foreground truncate">
                                                {contract.freelancerName}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {contract.projectTitle}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-xs font-bold text-foreground">
                                                {approved}/{milestones.length}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">
                                                milestones
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </CardContent>
                    </Card>

                    {/* Quick actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-2">
                            <Link href="/projects/create">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full justify-start gap-2"
                                >
                                    <PlusCircle className="w-4 h-4" />
                                    Post a new project
                                </Button>
                            </Link>
                            <Link href="/projects">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start gap-2"
                                >
                                    <Briefcase className="w-4 h-4" />
                                    Browse all projects
                                </Button>
                            </Link>
                            <Link href="/contracts">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start gap-2"
                                >
                                    <FileText className="w-4 h-4" />
                                    View my contracts
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
