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
import { SmartAvatar } from "@/modules/shared/components/avatar";
import { Button } from "@/modules/shared/components/button";
import { Card, CardContent } from "@/modules/shared/components/card";
import type { ProjectResponse } from "../../shared/types/project.shared";
import { useMyBid, useWithdrawBid } from "@/modules/bid/freelancer";
import { BidForm } from "@/modules/bid/freelancer/components/BidForm";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProjectDetailPanelProps {
    projectId: string;
}

// ─── Loading ──────────────────────────────────────────────────────────────────

function LoadingState() {
    return (
        <div className="flex items-center justify-center h-full py-32">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground/40" />
        </div>
    );
}

// ─── Empty prompt ─────────────────────────────────────────────────────────────

function SelectPrompt() {
    return (
        <div className="flex flex-col items-center justify-center h-full gap-4 py-32 text-center px-8">
            <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                className="text-muted-foreground/15"
            >
                <rect x="4" y="6" width="24" height="3" rx="1" fill="currentColor" />
                <rect x="4" y="13" width="18" height="2.5" rx="1" fill="currentColor" />
                <rect x="4" y="19.5" width="12" height="2.5" rx="1" fill="currentColor" />
                <rect x="30" y="20" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M37 28V32M37 28V28M35 30H39" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <div className="space-y-1">
                <p className="font-display text-sm font-bold text-muted-foreground/40">
                    Select a project
                </p>
                <p className="font-mono text-[11px] text-muted-foreground/30">
                    Choose from the list to view details
                </p>
            </div>
        </div>
    );
}

// ─── Error ────────────────────────────────────────────────────────────────────

function FetchError({ onRetry }: { onRetry: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center h-full gap-3 py-32 text-center px-8">
            <AlertCircle className="w-5 h-5 text-destructive/50" />
            <div className="space-y-0.5">
                <p className="text-sm font-medium text-muted-foreground">Could not load project</p>
                <p className="font-mono text-[11px] text-muted-foreground/50">Check your connection and try again</p>
            </div>
            <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5 h-7 text-xs font-mono mt-1">
                <RotateCcw className="w-3 h-3" />
                Retry
            </Button>
        </div>
    );
}

// ─── Stat block ───────────────────────────────────────────────────────────────

function StatBlock({
    value,
    label,
    urgent,
}: {
    value: React.ReactNode;
    label: string;
    urgent?: boolean;
}) {
    return (
        <div className="flex flex-col gap-0.5 min-w-0">
            <span
                className={cn(
                    "font-mono text-xl font-semibold tabular-nums tracking-tight leading-none",
                    urgent ? "text-warning" : "text-foreground",
                )}
            >
                {value}
            </span>
            <span className="font-mono text-[11px] text-muted-foreground/60 uppercase tracking-wider">
                {label}
            </span>
        </div>
    );
}

// ─── Project hero (replaces ProjectHeader card) ───────────────────────────────

function ProjectHero({
    project,
    daysLeft,
    closingSoon,
}: {
    project: ProjectResponse;
    daysLeft: number;
    closingSoon: boolean;
}) {
    return (
        <div className="space-y-6">
            {/* Badges + closing indicator */}
            <div className="flex items-center gap-2 flex-wrap">
                <CategoryBadge category={project.category} />
                <ProjectStatusBadge status={project.status} />
                {closingSoon && (
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold px-2 py-0.5 rounded-sm border bg-warning/8 text-warning border-warning/20">
                        <AlertCircle className="w-2.5 h-2.5" />
                        Closing soon
                    </span>
                )}
            </div>

            {/* Title — display font, large */}
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground leading-tight tracking-tight">
                {project.title}
            </h1>

            {/* Stat row */}
            <div className="flex items-start gap-8 flex-wrap border-y border-border/50 py-5">
                <StatBlock
                    value={formatBudget(project.budgetMin, project.budgetMax)}
                    label="Budget"
                />
                <StatBlock
                    value={project.bidCount}
                    label="Proposals"
                />
                <StatBlock
                    value={daysLeft > 0 ? `${daysLeft}d` : "Expired"}
                    label={formatDate(project.deadline)}
                    urgent={daysLeft <= 7 && daysLeft > 0}
                />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
                <p className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest">
                    Description
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                    {project.description}
                </p>
            </div>

            {/* Skills */}
            {project.requiredSkills?.length > 0 && (
                <div className="space-y-2">
                    <p className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest">
                        Required Skills
                    </p>
                    <div className="flex gap-1.5 flex-wrap">
                        {project.requiredSkills.map((skill) => (
                            <span
                                key={skill}
                                className="font-mono text-[11px] text-muted-foreground px-2 py-0.5 rounded-sm bg-muted/50 border border-border/40"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Freelancer bid section ───────────────────────────────────────────────────

function FreelancerBidSection({
    projectId,
    isOpen,
}: {
    projectId: string;
    isOpen: boolean;
}) {
    const { data: myBid, isLoading } = useMyBid(projectId, true);
    const withdrawBid = useWithdrawBid();

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 py-4">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground/40" />
                <span className="font-mono text-[11px] text-muted-foreground/50">Loading your proposal…</span>
            </div>
        );
    }

    if (myBid) {
        return (
            <div className="border border-border/50 rounded-md p-4 space-y-3 bg-muted/20">
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                        <p className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest">
                            Your Proposal
                        </p>
                        <div className="flex items-baseline gap-3">
                            <span className="font-mono text-lg font-semibold text-foreground tabular-nums">
                                {formatCurrency(myBid.proposedPrice)}
                            </span>
                            <span className="font-mono text-xs text-muted-foreground">
                                {myBid.estimatedDays}d estimated
                            </span>
                        </div>
                    </div>
                    <BidStatusBadge status={myBid.status} />
                </div>

                {myBid.status === "PENDING" && (
                    <div className="space-y-1.5">
                        <Button
                            variant="outline"
                            size="sm"
                            loading={withdrawBid.isPending}
                            disabled={withdrawBid.isPending}
                            onClick={() => withdrawBid.mutate(myBid.id)}
                            className="h-7 text-xs font-mono text-destructive border-destructive/20 hover:bg-destructive/5 hover:border-destructive/30"
                        >
                            Withdraw proposal
                        </Button>
                        {withdrawBid.isError && (
                            <p className="font-mono text-[11px] text-destructive">
                                Withdrawal failed — please try again.
                            </p>
                        )}
                    </div>
                )}
            </div>
        );
    }

    if (!isOpen) {
        return (
            <div className="border border-border/40 rounded-md px-4 py-3 bg-muted/10">
                <p className="font-mono text-[11px] text-muted-foreground/60">
                    This project is no longer accepting proposals.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div>
                <p className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest mb-1">
                    Submit Proposal
                </p>
                <p className="text-xs text-muted-foreground/70">
                    Send your bid directly to the client.
                </p>
            </div>
            <BidForm projectId={projectId} onSuccess={() => {}} />
        </div>
    );
}

// ─── Sidebar: client card ─────────────────────────────────────────────────────

function ClientSideCard({ project }: { project: ProjectResponse }) {
    return (
        <Card className="border-border/50">
            <CardContent className="p-4">
                <p className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest mb-3">
                    Client
                </p>
                <div className="flex items-center gap-2.5">
                    <SmartAvatar name={project.clientName} size="sm" />
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate leading-tight">
                            {project.clientName}
                        </p>
                        {project.clientCompany && (
                            <p className="font-mono text-[11px] text-muted-foreground/60 flex items-center gap-1 mt-0.5 truncate">
                                <Building2 className="w-2.5 h-2.5 shrink-0" />
                                {project.clientCompany}
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Sidebar: meta card ───────────────────────────────────────────────────────

function MetaSideCard({ project }: { project: ProjectResponse }) {
    const rows = [
        {
            icon: <Briefcase className="w-3 h-3" />,
            label: "Category",
            value: project.category?.replace(/_/g, " "),
        },
        {
            icon: <Clock className="w-3 h-3" />,
            label: "Deadline",
            value: <span className="font-mono text-[12px]">{formatDate(project.deadline)}</span>,
        },
        {
            icon: <Users className="w-3 h-3" />,
            label: "Proposals",
            value: <span className="font-mono text-[12px] tabular-nums">{project.bidCount}</span>,
        },
        {
            icon: <CheckCircle2 className="w-3 h-3" />,
            label: "Status",
            value: <ProjectStatusBadge status={project.status} />,
        },
    ];

    return (
        <Card className="border-border/50">
            <CardContent className="p-4 space-y-3">
                <p className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest">
                    Details
                </p>
                {rows.map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60 min-w-0">
                            {row.icon}
                            <span className="font-mono text-[11px] truncate">{row.label}</span>
                        </div>
                        <div className="text-xs font-medium text-foreground/90 text-right shrink-0">
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

    const { data: project, isLoading, error, refetch } = useProject(projectId);

    if (!projectId) return <SelectPrompt />;
    if (isLoading) return <LoadingState />;
    if (error || !project) return <FetchError onRetry={() => refetch()} />;

    const daysLeft = daysUntil(project.deadline);
    const isOpen = project.status === "OPEN";
    const closingSoon = isOpen && daysLeft > 0 && daysLeft <= 7;

    return (
        <div className="h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto px-5 sm:px-8 py-8 sm:py-10">

                {/* ── Hero section ───────────────────────────────────────── */}
                <ProjectHero
                    project={project}
                    daysLeft={daysLeft}
                    closingSoon={closingSoon}
                />

                {/* ── Content grid ───────────────────────────────────────── */}
                <div className="mt-10 grid lg:grid-cols-3 gap-8 lg:gap-10">

                    {/* Left: Freelancer bid section */}
                    <div className="lg:col-span-2">
                        {isFreelancer && (
                            <FreelancerBidSection
                                projectId={project.id}
                                isOpen={isOpen}
                            />
                        )}
                    </div>

                    {/* Right: Sidebar */}
                    <div className="space-y-3">
                        <ClientSideCard project={project} />
                        <MetaSideCard project={project} />
                    </div>
                </div>
            </div>
        </div>
    );
}