"use client";

import {
    AlertCircle,
    Briefcase,
    Building2,
    CheckCircle2,
    Clock,
    Loader2,
    RotateCcw,
    Users,
} from "lucide-react";

import { cn, daysUntil, formatBudget, formatCurrency, formatDate } from "@/modules/shared";
import {
    BidStatusBadge,
    CategoryBadge,
    ProjectStatusBadge,
} from "@/modules/shared/components/status-badge";
import { selectIsAuthenticated, selectRole, useAuthStore } from "@/store/auth-store";
import { useProject } from "../hooks/useProject";
import { BidForm } from "../../bid/components/FreelancerBidForm";
import { EmptyState } from "@/modules/shared/components/empty-state";
import { Alert } from "@/modules/shared/components/alert";
import { Avatar } from "@/modules/shared/components/avatar";
import { Button } from "@/modules/shared/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/components/card";
import { SkillTag } from "@/modules/shared/components/skil-tag";
import { useMyBid, useWithdrawBid } from "@/modules/bid/hooks/useFreelancerBids";
import { ProjectResponse } from "../types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProjectDetailPanelProps {
    projectId: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Full-area spinner used while the project is loading. */
function LoadingState() {
    return (
        <div className="h-full flex items-center justify-center text-muted-foreground py-24">
            <Loader2 className="w-7 h-7 animate-spin" />
        </div>
    );
}

/** Shown when no project is selected. */
function SelectPrompt() {
    return (
        <div className="h-full flex items-center justify-center py-24">
            <EmptyState
                title="Select a project"
                description="Choose a project from the list to view its details."
            />
        </div>
    );
}

interface FetchErrorProps {
    onRetry: () => void;
}

/** Shown when the project fetch fails. */
function FetchError({ onRetry }: FetchErrorProps) {
    return (
        <div className="p-6 space-y-4 max-w-md">
            <Alert variant="destructive" title="Failed to load project">
                The project could not be fetched. Check your connection and try again.
            </Alert>
            <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" />
                Retry
            </Button>
        </div>
    );
}

// ─── Stat cell used in the quick-stats row ────────────────────────────────────

interface StatCellProps {
    value: React.ReactNode;
    label: string;
    className?: string;
    valueClassName?: string;
}

function StatCell({ value, label, className, valueClassName }: StatCellProps) {
    return (
        <div className={cn("text-center px-2", className)}>
            <div className={cn("text-lg font-bold text-foreground tabular-nums", valueClassName)}>
                {value}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
        </div>
    );
}

// ─── Project header card ──────────────────────────────────────────────────────

interface ProjectHeaderProps {
    project: ProjectResponse;
    daysLeft: number;
    closingSoon: boolean;
}

function ProjectHeader({ project, daysLeft, closingSoon }: ProjectHeaderProps) {
    return (
        <Card>
            <CardContent className="p-5 sm:p-6">
                {/* Badges */}
                <div className="flex gap-2 mb-3 flex-wrap">
                    <CategoryBadge category={project.category} />
                    <ProjectStatusBadge status={project.status} />
                    {closingSoon && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-500/10 text-amber-600 border-amber-500/20">
                            <AlertCircle className="w-3 h-3" />
                            Closing soon
                        </span>
                    )}
                </div>

                {/* Title */}
                <h1 className="text-xl font-bold text-foreground mb-5 leading-snug">
                    {project.title}
                </h1>

                {/* Quick stats */}
                <div className="grid grid-cols-3 divide-x divide-border border-y border-border py-4 mb-5">
                    <StatCell
                        value={formatBudget(project.budgetMin, project.budgetMax)}
                        label="Budget"
                    />
                    <StatCell
                        value={project.bidCount}
                        label="Proposals"
                    />
                    <StatCell
                        value={daysLeft > 0 ? `${daysLeft}d` : "Expired"}
                        label={formatDate(project.deadline)}
                        valueClassName={
                            daysLeft <= 7 && daysLeft > 0 ? "text-amber-600" : undefined
                        }
                    />
                </div>

                {/* Description */}
                <div className="space-y-4">
                    <div>
                        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                            Project Description
                        </h2>
                        <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-line">
                            {project.description}
                        </p>
                    </div>

                    {/* Required skills */}
                    {project.requiredSkills?.length > 0 && (
                        <div>
                            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5">
                                Required Skills
                            </h2>
                            <div className="flex gap-2 flex-wrap">
                                {project.requiredSkills.map((skill) => (
                                    <SkillTag key={skill} skill={skill} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Freelancer bid section ───────────────────────────────────────────────────

interface FreelancerBidSectionProps {
    projectId: string;
    isOpen: boolean;
}

function FreelancerBidSection({ projectId, isOpen }: FreelancerBidSectionProps) {
    const { data: myBid, isLoading } = useMyBid(projectId, true);
    const withdrawBid = useWithdrawBid();

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // User already has a bid — show bid status and optional withdrawal
    if (myBid) {
        return (
            <Card>
                <CardContent className="p-5 space-y-3">
                    <Alert variant="default" title="You've already submitted a proposal">
                        Your bid of{" "}
                        <span className="font-semibold">{formatCurrency(myBid.proposedPrice)}</span>{" "}
                        for{" "}
                        <span className="font-semibold">{myBid.estimatedDays} days</span>{" "}
                        is <BidStatusBadge status={myBid.status} className="inline-flex" />.
                    </Alert>

                    {myBid.status === "PENDING" && (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                loading={withdrawBid.isPending}
                                disabled={withdrawBid.isPending}
                                onClick={() => withdrawBid.mutate(myBid.id)}
                                className="text-destructive border-destructive/30 hover:bg-destructive/5"
                            >
                                Withdraw Proposal
                            </Button>
                            {withdrawBid.isError && (
                                <p className="text-xs text-destructive">
                                    Withdrawal failed — please try again.
                                </p>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        );
    }

    // Project is closed, no existing bid
    if (!isOpen) {
        return (
            <Alert variant="default" title="This project is no longer accepting proposals">
                The submission window for this project has closed.
            </Alert>
        );
    }

    // Open project, no existing bid — show the bid form
    return (
        <Card>
            <CardHeader>
                <CardTitle>Submit Your Proposal</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <BidForm projectId={projectId} onSuccess={() => {}} />
            </CardContent>
        </Card>
    );
}

// ─── Client info card ─────────────────────────────────────────────────────────

interface ClientCardProps {
    project: ProjectResponse;
}

function ClientCard({ project }: ClientCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>About the Client</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="flex items-center gap-3">
                    <Avatar name={project.clientName} size="md" />
                    <div className="min-w-0">
                        <p className="font-bold text-foreground truncate">
                            {project.clientName}
                        </p>
                        {project.clientCompany && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Building2 className="w-3 h-3 shrink-0" />
                                <span className="truncate">{project.clientCompany}</span>
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Project meta card ────────────────────────────────────────────────────────

interface MetaRow {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
}

interface ProjectMetaCardProps {
    project: ProjectResponse;
}

function ProjectMetaCard({ project }: ProjectMetaCardProps) {
    const rows: MetaRow[] = [
        {
            icon: <Briefcase className="w-4 h-4" />,
            label: "Category",
            value: project.category?.replace(/_/g, " "),
        },
        {
            icon: <Clock className="w-4 h-4" />,
            label: "Deadline",
            value: formatDate(project.deadline),
        },
        {
            icon: <Users className="w-4 h-4" />,
            label: "Proposals",
            value: `${project.bidCount} submitted`,
        },
        {
            icon: <CheckCircle2 className="w-4 h-4" />,
            label: "Status",
            value: <ProjectStatusBadge status={project.status} />,
        },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3.5">
                {rows.map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
                            {row.icon}
                            <span className="truncate">{row.label}</span>
                        </div>
                        <div className="text-sm font-medium text-foreground text-right shrink-0">
                            {row.value}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ProjectDetailPanel({ projectId }: ProjectDetailPanelProps) {
    const role = useAuthStore(selectRole);
    const isAuthenticated = useAuthStore(selectIsAuthenticated);
    const isFreelancer = isAuthenticated && role === "FREELANCER";

    const {
        data: project,
        isLoading,
        error,
        refetch,
    } = useProject(projectId);

    // ── Guard clauses (ordered: cheapest check first) ──────────────────────────
    if (!projectId) return <SelectPrompt />;
    if (isLoading) return <LoadingState />;
    if (error || !project) return <FetchError onRetry={() => refetch()} />;

    // ── Derived values ─────────────────────────────────────────────────────────
    const daysLeft = daysUntil(project.deadline);
    const isOpen = project.status === "OPEN";
    const closingSoon = isOpen && daysLeft > 0 && daysLeft <= 7;

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-5">
            {/* Header */}
            <ProjectHeader project={project} daysLeft={daysLeft} closingSoon={closingSoon} />

            {/* Body: two-column on large screens */}
            <div className="grid lg:grid-cols-5 gap-5">
                {/* Main column */}
                <div className="lg:col-span-3 space-y-4">
                    {isFreelancer && (
                        <FreelancerBidSection projectId={project.id} isOpen={isOpen} />
                    )}
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-2 space-y-4">
                    <ClientCard project={project} />
                    <ProjectMetaCard project={project} />
                </div>
            </div>
        </div>
    );
}