"use client";

import { useState } from "react";
import {
    Clock,
    Users,
    Building2,
    CheckCircle2,
    AlertCircle,
    Briefcase,
    Loader2,
} from "lucide-react";
import {
    formatBudget,
    formatDate,
    daysUntil,
    formatCurrency,
    cn,
} from "@/lib/utils";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Avatar,
    Alert,
    SkillTag,
    EmptyState,
} from "@/components/ui";
import {
    ProjectStatusBadge,
    CategoryBadge,
    BidStatusBadge,
} from "@/components/shared/status-badge";

import { useProject } from "@/modules/projects/hooks/useProject";
import { BidForm } from "./BidForm";
import { BidListItem } from "./BidListItem";

// NOTE: Bids are still mocked as we lack the Bid API contract.
import { MOCK_MY_BIDS, MOCK_PROJECT_BIDS } from "@/lib/mock-data";
import { useAuthStore } from "@/store/auth-store";

interface ProjectDetailPanelProps {
    projectId: string;
}

export function ProjectDetailPanel({ projectId }: ProjectDetailPanelProps) {
    // Current user context (Ideally comes from an Auth hook)
    const { userId, role, isAuthenticated } = useAuthStore();

    const isFreelancer = isAuthenticated && role === "FREELANCER";
    const isClient = isAuthenticated && role === "CLIENT";

    // ── Fetch real project data ──────────────────────────────
    const { data: project, isLoading, error } = useProject(projectId);

    // ── Local states for mock bids ───────────────────────────
    const existingBid = MOCK_MY_BIDS.find((b) => b.projectId === projectId);
    const [bids, setBids] = useState(MOCK_PROJECT_BIDS);
    const [bidSubmitted, setBidSubmitted] = useState(false);

    // ── Handle Edge Cases ────────────────────────────────────
    if (!projectId) {
        return (
            <div className="h-full flex items-center justify-center">
                <EmptyState
                    title="Select a project"
                    description="Choose a project from the sidebar to view details."
                />
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (error || !project) {
        return (
            <Alert variant="destructive" title="Project not found">
                The project you are looking for does not exist or has been
                removed.
            </Alert>
        );
    }

    // ── Derived Data ─────────────────────────────────────────
    const daysLeft = daysUntil(project.deadline);
    const isOwner = userId === project.clientId;

    const handleAccept = (bidId: string) => {
        setBids((prev) =>
            prev.map((b) =>
                b.id === bidId
                    ? { ...b, status: "ACCEPTED" }
                    : { ...b, status: "REJECTED" },
            ),
        );
    };

    const handleReject = (bidId: string) => {
        setBids((prev) =>
            prev.map((b) =>
                b.id === bidId ? { ...b, status: "REJECTED" } : b,
            ),
        );
    };

    return (
        <div className="space-y-5">
            {/* Header card */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex gap-2 mb-3 flex-wrap">
                        <CategoryBadge category={project.category} />
                        <ProjectStatusBadge status={project.status} />
                        {daysLeft > 0 &&
                            daysLeft <= 7 &&
                            project.status === "OPEN" && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-500/10 text-amber-600 border-amber-500/20">
                                    <AlertCircle className="w-3 h-3" />
                                    Closing soon
                                </span>
                            )}
                    </div>

                    <h1 className="text-xl font-bold text-foreground mb-4 leading-snug">
                        {project.title}
                    </h1>

                    {/* Quick stats */}
                    <div className="grid grid-cols-3 gap-4 py-4 border-y border-border">
                        <div className="text-center">
                            <div className="text-lg font-bold text-foreground">
                                {formatBudget(
                                    project.budgetMin,
                                    project.budgetMax,
                                )}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                                Budget Range
                            </div>
                        </div>
                        <div className="text-center border-x border-border">
                            <div className="text-lg font-bold text-foreground">
                                {project.bidCount}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                                Proposals
                            </div>
                        </div>
                        <div className="text-center">
                            <div
                                className={cn(
                                    "text-lg font-bold",
                                    daysLeft <= 7
                                        ? "text-amber-600"
                                        : "text-foreground",
                                )}
                            >
                                {daysLeft > 0 ? `${daysLeft}d` : "Expired"}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                                {formatDate(project.deadline)}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mt-4">
                        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3">
                            Project Description
                        </h2>
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                            {project.description}
                        </p>
                    </div>

                    {/* Skills */}
                    <div className="mt-5">
                        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3">
                            Required Skills
                        </h2>
                        <div className="flex gap-2 flex-wrap">
                            {project.requiredSkills?.map((skill) => (
                                <SkillTag key={skill} skill={skill} />
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Two-column: main content + sidebar */}
            <div className="grid lg:grid-cols-5 gap-5">
                <div className="lg:col-span-3 space-y-4">
                    {/* Bid form */}
                    {isFreelancer &&
                        project.status === "OPEN" &&
                        !existingBid &&
                        !bidSubmitted && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Submit Your Proposal</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <BidForm
                                        projectId={project.id}
                                        onSubmit={() => setBidSubmitted(true)}
                                    />
                                </CardContent>
                            </Card>
                        )}

                    {/* Already bid */}
                    {isFreelancer && existingBid && (
                        <Alert
                            variant="default"
                            title="You've already submitted a proposal"
                        >
                            Your bid of{" "}
                            {formatCurrency(existingBid.proposedPrice)} for{" "}
                            {existingBid.estimatedDays} days is{" "}
                            <BidStatusBadge
                                status={existingBid.status}
                                className="inline-flex"
                            />
                            .
                        </Alert>
                    )}

                    {/* Client Bid view */}
                    {isClient && isOwner && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-base font-bold text-foreground">
                                    Proposals ({bids.length})
                                </h2>
                            </div>
                            {bids.map((bid) => (
                                <BidListItem
                                    key={bid.id}
                                    bid={bid}
                                    onAccept={handleAccept}
                                    onReject={handleReject}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Right sidebar: Meta */}
                <div className="lg:col-span-2 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>About the Client</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                            <div className="flex items-center gap-3">
                                <Avatar name={project.clientName} size="md" />
                                <div>
                                    <p className="font-bold text-foreground">
                                        {project.clientName}
                                    </p>
                                    {project.clientCompany && (
                                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                            <Building2 className="w-3 h-3" />
                                            {project.clientCompany}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Project Details</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                            {[
                                {
                                    icon: <Briefcase className="w-4 h-4" />,
                                    label: "Category",
                                    value: project.category?.replace("_", " "),
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
                                    value: (
                                        <ProjectStatusBadge
                                            status={project.status}
                                        />
                                    ),
                                },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="flex items-center justify-between gap-2"
                                >
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        {item.icon}
                                        {item.label}
                                    </div>
                                    <div className="text-sm font-medium text-foreground">
                                        {item.value}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
