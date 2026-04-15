"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
    PlusCircle,
    GitBranch,
    Clock,
    Edit,
    Trash2,
    ArrowRight,
    Search,
    Briefcase,
    CheckCircle2,
    AlertCircle,
    XCircle,
} from "lucide-react";

import {
    ProjectStatusBadge,
    CategoryBadge,
} from "@/modules/shared/components/status-badge";
import { Card, CardContent } from "@/modules/shared/components/card";
import { SkillTag } from "@/modules/shared/components/skil-tag";
import { Button } from "@/modules/shared/components/button";
import { StatCard } from "@/modules/shared/components/stat-card";
import { Alert } from "@/modules/shared/components/alert";
import { InputField } from "@/modules/shared/components/input";
import { EmptyState } from "@/modules/shared/components/empty-state";
import { Skeleton } from "@/modules/shared/components/skeleton";
import {
    FilterTabs,
    type FilterTab,
} from "@/modules/shared/components/FilterTabs";

import {
    daysUntil,
    formatBudget,
    formatDate,
    formatRelative,
} from "@/modules/shared";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/modules/shared/components/alert-dialog";
import {
    ProjectStatus,
    ProjectSummaryResponse,
} from "@/modules/project/shared/types/project.shared";
import { useMyProjects } from "@/modules/project/client/hooks/useMyProjects";
import { useCancelProject } from "@/modules/project/client/hooks/useCancelProject";
import { PageHeader } from "@/modules/shared/components/PageHeader";

// ─── Status filter tabs config ────────────────────────────────────────────────

export type ProjectTabValue = ProjectStatus | "ALL";

const PROJECT_TABS_CONFIG: FilterTab<ProjectTabValue>[] = [
    { label: "All", value: "ALL", icon: <Briefcase className="w-3.5 h-3.5" /> },
    {
        label: "Open",
        value: "OPEN",
        icon: <AlertCircle className="w-3.5 h-3.5" />,
    },
    {
        label: "In Progress",
        value: "IN_PROGRESS",
        icon: <Clock className="w-3.5 h-3.5" />,
    },
    {
        label: "Completed",
        value: "COMPLETED",
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    {
        label: "Cancelled",
        value: "CANCELLED",
        icon: <XCircle className="w-3.5 h-3.5" />,
    },
];

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function ProjectRowSkeleton() {
    return (
        <Card>
            <CardContent className="p-5">
                <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-3">
                        <div className="flex gap-2">
                            <Skeleton className="h-5 w-20 rounded-full" />
                            <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                        <Skeleton className="h-4 w-2/3" />
                        <div className="flex gap-4">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-3 w-28" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                        <div className="flex gap-1.5">
                            <Skeleton className="h-5 w-14 rounded-md" />
                            <Skeleton className="h-5 w-18 rounded-md" />
                            <Skeleton className="h-5 w-16 rounded-md" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-8 w-24 rounded-lg" />
                        <Skeleton className="h-8 w-16 rounded-lg" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Project Row ──────────────────────────────────────────────────────────────

function ProjectRow({
    project,
    onCancel,
    cancelling,
}: {
    project: ProjectSummaryResponse;
    onCancel: (id: string) => void;
    cancelling: boolean;
}) {
    const [showCancel, setShowCancel] = useState(false);
    const daysLeft = daysUntil(project.deadline);

    return (
        <>
            <Card className="group hover:border-primary/30 hover:shadow-md transition-all duration-200">
                <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                        {/* Main info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <CategoryBadge category={project.category} />
                                <ProjectStatusBadge status={project.status} />
                                {daysLeft > 0 &&
                                    daysLeft <= 7 &&
                                    project.status === "OPEN" && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-500/10 text-amber-600 border-amber-500/20">
                                            <AlertCircle className="w-3 h-3" />
                                            {daysLeft}d left
                                        </span>
                                    )}
                            </div>

                            <Link href={`/client/projects/${project.id}`}>
                                <h3 className="font-bold text-foreground hover:text-primary transition-colors text-sm leading-snug line-clamp-1 mb-2">
                                    {project.title}
                                </h3>
                            </Link>

                            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-3">
                                <span className="flex items-center gap-1">
                                    <GitBranch className="w-3 h-3" />
                                    <span className="font-semibold text-foreground">
                                        {project.bidCount}
                                    </span>{" "}
                                    proposals
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Due {formatDate(project.deadline)}
                                    {daysLeft > 0
                                        ? ` (${daysLeft}d)`
                                        : daysLeft === 0
                                          ? " (today)"
                                          : " (expired)"}
                                </span>
                                <span className="font-semibold text-foreground">
                                    {formatBudget(
                                        project.budgetMin,
                                        project.budgetMax,
                                    )}
                                </span>
                                {project.createdAt && (
                                    <span>
                                        Posted{" "}
                                        {formatRelative(project.createdAt)}
                                    </span>
                                )}
                            </div>

                            <div className="flex gap-1.5 flex-wrap">
                                {project.requiredSkills
                                    .slice(0, 4)
                                    .map((skill) => (
                                        <SkillTag key={skill} skill={skill} />
                                    ))}
                                {project.requiredSkills.length > 4 && (
                                    <span className="text-[10px] text-muted-foreground font-medium self-center">
                                        +{project.requiredSkills.length - 4}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 shrink-0">
                            <Link href={`/client/projects/${project.id}`}>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full text-xs gap-1.5"
                                >
                                    <GitBranch className="w-3.5 h-3.5" />
                                    {project.bidCount > 0
                                        ? `View ${project.bidCount} Bids`
                                        : "View"}
                                </Button>
                            </Link>

                            {project.status === "OPEN" && (
                                <>
                                    <Link
                                        href={`/client/projects/${project.id}/edit`}
                                    >
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="w-full text-xs"
                                        >
                                            <Edit className="w-3.5 h-3.5" />
                                            Edit
                                        </Button>
                                    </Link>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setShowCancel(true)}
                                        disabled={cancelling}
                                        className="w-full text-xs text-destructive hover:text-destructive hover:bg-destructive/5"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Cancel
                                    </Button>
                                </>
                            )}

                            {project.status === "IN_PROGRESS" && (
                                <Link href="/client/contracts/">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="w-full text-xs"
                                    >
                                        <ArrowRight className="w-3.5 h-3.5" />
                                        Contract
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <AlertDialog open={showCancel} onOpenChange={setShowCancel}>
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Project?</AlertDialogTitle>
                        <AlertDialogDescription>
                            &quot;{project.title}&quot; will be marked as
                            cancelled. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep Project</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            onClick={() => onCancel(project.id)}
                        >
                            Cancel Project
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyProjectsPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<ProjectTabValue>("ALL");
    const [cancelledId, setCancelledId] = useState<string | null>(null);

    const { data, isLoading, error } = useMyProjects({ page: 0, size: 100 });

    const projects = useMemo(() => data?.content ?? [], [data?.content]);

    const cancelProject = useCancelProject();

    const handleCancel = (id: string) => {
        cancelProject.mutate(id);
        setCancelledId(id);
        setTimeout(() => setCancelledId(null), 3000);
    };

    // Calculate grouping stats for our filter and tabs
    const open = projects.filter((p) => p.status === "OPEN").length;
    const inProgress = projects.filter(
        (p) => p.status === "IN_PROGRESS",
    ).length;
    const completed = projects.filter((p) => p.status === "COMPLETED").length;
    const cancelled = projects.filter((p) => p.status === "CANCELLED").length;
    const totalBids = projects.reduce((s, p) => s + p.bidCount, 0);

    const filtered = useMemo(
        () =>
            projects.filter((p) => {
                if (
                    search &&
                    !p.title.toLowerCase().includes(search.toLowerCase())
                )
                    return false;
                if (statusFilter !== "ALL" && p.status !== statusFilter)
                    return false;
                return true;
            }),
        [projects, search, statusFilter],
    );

    // 1. Merge static config with dynamic badge data natively inside a hook
    const filterTabsData = useMemo(() => {
        return PROJECT_TABS_CONFIG.map((tab) => {
            let badgeCount: number | undefined;

            if (tab.value === "ALL") badgeCount = projects.length;
            else if (tab.value === "OPEN") badgeCount = open;
            else if (tab.value === "IN_PROGRESS") badgeCount = inProgress;
            else if (tab.value === "COMPLETED") badgeCount = completed;
            else if (tab.value === "CANCELLED") badgeCount = cancelled;

            return {
                ...tab,
                badge: badgeCount,
            };
        });
    }, [projects.length, open, inProgress, completed, cancelled]);

    // 2. Early return stays BELOW all hooks
    if (error) {
        return (
            <Alert variant="destructive">
                Failed to load your projects. Please refresh the page.
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <PageHeader
                title="My Projects"
                subtitle={
                    isLoading ? (
                        <Skeleton className="h-4 w-48" />
                    ) : (
                        `${projects.length} total · ${open} open · ${inProgress} in progress`
                    )
                }
                action={
                    <Link href="/client/projects/create">
                        <Button variant="outline">
                            <PlusCircle className="w-3.5 h-3.5" />
                            Post Project
                        </Button>
                    </Link>
                }
            />

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Open"
                    value={isLoading ? "—" : open}
                    icon={<Briefcase className="w-4 h-4" />}
                />
                <StatCard
                    label="In Progress"
                    value={isLoading ? "—" : inProgress}
                    icon={<Clock className="w-4 h-4" />}
                />
                <StatCard
                    label="Completed"
                    value={isLoading ? "—" : completed}
                    icon={<CheckCircle2 className="w-4 h-4" />}
                />
                <StatCard
                    label="Total Bids Received"
                    value={isLoading ? "—" : totalBids}
                    icon={<GitBranch className="w-4 h-4" />}
                    trend={{ value: "+5 this week", positive: true }}
                />
            </div>

            {/* Cancellation feedback */}
            {cancelledId && (
                <Alert variant="destructive">
                    Project cancelled successfully.
                </Alert>
            )}

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="w-full sm:flex-1">
                    <InputField
                        placeholder="Search your projects…"
                        startIcon={<Search className="w-4 h-4" />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* 3. Render purely with your mapped state */}
                <FilterTabs
                    tabs={filterTabsData}
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                    className="shrink-0 sm:w-auto"
                />
            </div>

            {/* List */}
            {isLoading ? (
                <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <ProjectRowSkeleton key={i} />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <EmptyState
                    icon={<Briefcase className="w-5 h-5" />}
                    title="No projects found"
                    description={
                        search || statusFilter !== "ALL"
                            ? "Try adjusting your search or filter."
                            : "You haven't posted any projects yet. Get started!"
                    }
                    action={
                        <Link href="/projects/create">
                            <Button size="sm">
                                <PlusCircle className="w-3.5 h-3.5" />
                                Post Your First Project
                            </Button>
                        </Link>
                    }
                />
            ) : (
                <div className="space-y-3">
                    {filtered.map((project) => (
                        <ProjectRow
                            key={project.id}
                            project={project}
                            onCancel={handleCancel}
                            cancelling={cancelProject.isPending}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
