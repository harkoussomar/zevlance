"use client";

import { useState } from "react";
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
} from "lucide-react";
import { MOCK_MY_PROJECTS } from "@/lib/mock-data";
import {
    formatBudget,
    formatDate,
    formatRelative,
    daysUntil,
    cn,
} from "@/lib/utils";
import {
    Button,
    Input,
    Card,
    CardContent,
    EmptyState,
    StatCard,
    SkillTag,
    Dialog,
    Alert,
} from "@/components/ui";
import {
    ProjectStatusBadge,
    CategoryBadge,
} from "@/components/shared/status-badge";
import type { ProjectStatus, ProjectSummaryResponse } from "@/types";

// ─── Status filter tabs ───────────────────────────────────────────────────────

const STATUS_TABS: Array<{ value: ProjectStatus | "ALL"; label: string }> = [
    { value: "ALL", label: "All" },
    { value: "OPEN", label: "Open" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CANCELLED", label: "Cancelled" },
];

// ─── Project Row ──────────────────────────────────────────────────────────────

function ProjectRow({
    project,
    onCancel,
}: {
    project: ProjectSummaryResponse;
    onCancel: (id: string) => void;
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

                            <Link href={`/projects/${project.id}`}>
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
                            <Link href={`/projects/${project.id}`}>
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
                                    <Link href={`/projects/${project.id}/edit`}>
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
                                        className="w-full text-xs text-destructive hover:text-destructive hover:bg-destructive/5"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Cancel
                                    </Button>
                                </>
                            )}
                            {project.status === "IN_PROGRESS" && (
                                <Link href="/contracts">
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

            <Dialog
                open={showCancel}
                onClose={() => setShowCancel(false)}
                title="Cancel Project?"
                description={`"${project.title}" will be marked as cancelled. This cannot be undone.`}
                size="sm"
            >
                <div className="flex gap-3 mt-2">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowCancel(false)}
                    >
                        Keep Project
                    </Button>
                    <Button
                        className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        onClick={() => {
                            onCancel(project.id);
                            setShowCancel(false);
                        }}
                    >
                        Cancel Project
                    </Button>
                </div>
            </Dialog>
        </>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProjectsPage() {
    const [projects, setProjects] = useState(MOCK_MY_PROJECTS);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<ProjectStatus | "ALL">(
        "ALL",
    );
    const [cancelledId, setCancelledId] = useState<string | null>(null);

    const handleCancel = (id: string) => {
        setProjects((prev) =>
            prev.map((p) => (p.id === id ? { ...p, status: "CANCELLED" } : p)),
        );
        setCancelledId(id);
        setTimeout(() => setCancelledId(null), 3000);
    };

    const filtered = projects.filter((p) => {
        if (search && !p.title.toLowerCase().includes(search.toLowerCase()))
            return false;
        if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
        return true;
    });

    // Stats
    const open = projects.filter((p) => p.status === "OPEN").length;
    const inProgress = projects.filter(
        (p) => p.status === "IN_PROGRESS",
    ).length;
    const completed = projects.filter((p) => p.status === "COMPLETED").length;
    const totalBids = projects.reduce((s, p) => s + p.bidCount, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        My Projects
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {projects.length} total · {open} open · {inProgress} in
                        progress
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
                    label="Open"
                    value={open}
                    icon={<Briefcase className="w-4 h-4" />}
                />
                <StatCard
                    label="In Progress"
                    value={inProgress}
                    icon={<Clock className="w-4 h-4" />}
                />
                <StatCard
                    label="Completed"
                    value={completed}
                    icon={<CheckCircle2 className="w-4 h-4" />}
                />
                <StatCard
                    label="Total Bids Received"
                    value={totalBids}
                    icon={<GitBranch className="w-4 h-4" />}
                    trend={{ value: "+5 this week", positive: true }}
                />
            </div>

            {/* Cancellation feedback */}
            {cancelledId && (
                <Alert variant="warning">Project cancelled successfully.</Alert>
            )}

            {/* Toolbar */}
            <div className="flex gap-3 flex-wrap">
                <Input
                    placeholder="Search your projects…"
                    startIcon={<Search className="w-4 h-4" />}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-xs"
                />
                <div className="flex gap-1 border border-border rounded-lg p-1 bg-muted/30">
                    {STATUS_TABS.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setStatusFilter(tab.value)}
                            className={cn(
                                "px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150",
                                statusFilter === tab.value
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground",
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            {filtered.length === 0 ? (
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
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
