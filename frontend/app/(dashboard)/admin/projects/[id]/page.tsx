"use client";

import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import {
    ArrowLeft,
    AlertCircle,
    Loader2,
    Star,
    StarOff,
    ShieldAlert,
    BadgeCheck,
    RefreshCw,
    Trash2,
    User,
    Wallet,
    Tag,
    Layers,
    FileText,
    Receipt,
    Clock,
} from "lucide-react";

import { useState } from "react";
import { Card } from "@/modules/shared/components/card";
import { ConfirmDialog } from "@/modules/shared/components/ConfirmDialog";
import { Textarea } from "@/modules/shared/components/textarea";
import { PageHeader } from "@/modules/shared/components/PageHeader";

import {
    useAdminProjectDetail,
    useChangeProjectStatus,
    useDeleteProject,
    useFeatureProject,
    useFlagProject,
} from "@/modules/admin/projects/hooks/useAdminProjects";
import {
    CATEGORY_LABELS,
    PROJECT_STATUSES,
    type BidSummary,
    type ContractSummary,
} from "@/modules/admin/projects/types/admin.projects.types";

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; dotClass: string; className: string }> = {
    OPEN: { label: "Open", dotClass: "bg-success", className: "bg-success/10 text-success border border-success/25 font-medium" },
    IN_PROGRESS: { label: "In Progress", dotClass: "bg-warning", className: "bg-warning/10 text-warning border border-warning/25 font-medium" },
    COMPLETED: { label: "Completed", dotClass: "bg-info", className: "bg-info/10 text-info border border-info/25 font-medium" },
    CANCELLED: { label: "Cancelled", dotClass: "bg-muted-foreground", className: "bg-muted text-muted-foreground border border-border font-medium" },
    SUSPENDED: { label: "Suspended", dotClass: "bg-destructive", className: "bg-destructive/10 text-destructive border border-destructive/25 font-medium" },
};

const BID_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    PENDING:  { label: "Pending",  className: "bg-warning/10 text-warning border-warning/25" },
    ACCEPTED: { label: "Accepted", className: "bg-success/10 text-success border-success/25" },
    REJECTED: { label: "Rejected", className: "bg-muted text-muted-foreground border-border" },
};

function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] ?? { label: status, dotClass: "bg-muted-foreground", className: "bg-muted text-muted-foreground border border-border font-medium" };
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] tracking-wide uppercase ${cfg.className}`}>
            <span className={`size-1.5 rounded-full shrink-0 ${cfg.dotClass}`} />
            {cfg.label}
        </span>
    );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
    return (
        <Card className="p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
                <Icon className="size-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            </div>
            {children}
        </Card>
    );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-4 py-1.5">
            <span className="text-xs text-muted-foreground shrink-0 w-28">{label}</span>
            <div className="text-sm text-foreground text-right">{children}</div>
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminProjectDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const { data: project, isLoading, isError } = useAdminProjectDetail(id);

    const statusMut = useChangeProjectStatus();
    const flagMut = useFlagProject();
    const featureMut = useFeatureProject();
    const deleteMut = useDeleteProject();

    // dialogs
    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [newStatus, setNewStatus] = useState("");
    const [statusReason, setStatusReason] = useState("");
    const [statusReasonError, setStatusReasonError] = useState(false);

    const [showFlagDialog, setShowFlagDialog] = useState(false);
    const [flagReason, setFlagReason] = useState("");
    const [flagReasonError, setFlagReasonError] = useState(false);

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteReason, setDeleteReason] = useState("");
    const [deleteReasonError, setDeleteReasonError] = useState(false);

    // ── Loading / Error ───────────────────────────────────────────────────────

    if (isLoading) {
        return (
            <div className="h-96 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <Loader2 className="size-6 animate-spin text-primary" />
                <span className="text-sm">Loading project…</span>
            </div>
        );
    }

    if (isError || !project) {
        return (
            <div className="h-96 flex flex-col items-center justify-center gap-3">
                <div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="size-6 text-destructive" />
                </div>
                <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">Project not found</p>
                    <p className="text-xs text-muted-foreground mt-0.5">It may have been deleted or the ID is invalid.</p>
                </div>
                <button
                    onClick={() => router.push("/admin/projects")}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                >
                    <ArrowLeft className="size-3" /> Back to projects
                </button>
            </div>
        );
    }

    // ── Action handlers ───────────────────────────────────────────────────────

    const handleStatusConfirm = () => {
        if (!statusReason.trim()) { setStatusReasonError(true); return; }
        if (!newStatus) return;
        statusMut.mutate({ id, status: newStatus, reason: statusReason.trim() }, {
            onSuccess: () => setShowStatusDialog(false),
        });
    };

    const handleFlagConfirm = () => {
        if (!flagReason.trim()) { setFlagReasonError(true); return; }
        flagMut.mutate({ id, flagged: !project.flagged, reason: flagReason.trim() }, {
            onSuccess: () => setShowFlagDialog(false),
        });
    };

    const handleDeleteConfirm = () => {
        if (!deleteReason.trim()) { setDeleteReasonError(true); return; }
        deleteMut.mutate({ id, reason: deleteReason.trim() }, {
            onSuccess: () => router.push("/admin/projects"),
        });
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <>
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => router.push("/admin/projects")}
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
                >
                    <ArrowLeft className="size-3" /> Back to projects
                </button>
                <PageHeader
                    title={project.title}
                    subtitle={`Project · ${project.id.slice(0, 8)}`}
                />
            </div>

            {/* Action bar */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
                <button
                    onClick={() => {
                        setShowStatusDialog(true);
                        setNewStatus("");
                        setStatusReason("");
                        setStatusReasonError(false);
                    }}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium border border-border bg-background hover:bg-muted transition-colors"
                >
                    <RefreshCw className="size-3 text-muted-foreground" /> Change status
                </button>

                <button
                    onClick={() => {
                        setShowFlagDialog(true);
                        setFlagReason("");
                        setFlagReasonError(false);
                    }}
                    className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium border transition-colors ${
                        project.flagged
                            ? "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20"
                            : "border-border bg-background hover:bg-muted"
                    }`}
                >
                    {project.flagged
                        ? <><BadgeCheck className="size-3" /> Clear flag</>
                        : <><ShieldAlert className="size-3 text-warning" /> Flag for review</>}
                </button>

                <button
                    onClick={() => featureMut.mutate({ id, featured: !project.featured })}
                    disabled={featureMut.isPending}
                    className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium border transition-colors ${
                        project.featured
                            ? "border-warning/30 bg-warning/10 text-warning hover:bg-warning/20"
                            : "border-border bg-background hover:bg-muted"
                    }`}
                >
                    {featureMut.isPending
                        ? <Loader2 className="size-3 animate-spin" />
                        : project.featured
                            ? <><StarOff className="size-3" /> Remove from featured</>
                            : <><Star className="size-3 text-warning" /> Feature project</>}
                </button>

                <button
                    onClick={() => {
                        setShowDeleteDialog(true);
                        setDeleteReason("");
                        setDeleteReasonError(false);
                    }}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors ml-auto"
                >
                    <Trash2 className="size-3" /> Delete project
                </button>
            </div>

            {/* Content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* ── Left col: Project info ─────────────────────────────── */}
                <div className="lg:col-span-2 space-y-5">

                    {/* Overview */}
                    <Section title="Project overview" icon={FileText}>
                        <InfoRow label="Status">
                            <StatusBadge status={project.status} />
                        </InfoRow>
                        <InfoRow label="Category">
                            <span>{CATEGORY_LABELS[project.category] ?? project.category}</span>
                        </InfoRow>
                        <InfoRow label="Budget">
                            <span>${project.budgetMin.toLocaleString()} — ${project.budgetMax.toLocaleString()}</span>
                        </InfoRow>
                        <InfoRow label="Deadline">
                            <span>{format(new Date(project.deadline), "MMM dd, yyyy")}</span>
                        </InfoRow>
                        <InfoRow label="Created">
                            <span>{format(new Date(project.createdAt), "MMM dd, yyyy · HH:mm")}</span>
                        </InfoRow>
                        {project.updatedAt && (
                            <InfoRow label="Last updated">
                                <span>{format(new Date(project.updatedAt), "MMM dd, yyyy · HH:mm")}</span>
                            </InfoRow>
                        )}
                        {project.requiredSkills.length > 0 && (
                            <div className="pt-2">
                                <span className="text-xs text-muted-foreground block mb-1.5">Required skills</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {project.requiredSkills.map((skill) => (
                                        <span key={skill} className="text-[11px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Section>

                    {/* Description */}
                    <Section title="Description" icon={Layers}>
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {project.description}
                        </p>
                    </Section>

                    {/* Bids */}
                    <Section title={`Bids (${project.bidCount})`} icon={Receipt}>
                        {project.bids.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">No bids yet.</p>
                        ) : (
                            <div className="space-y-2">
                                {project.bids.map((bid: BidSummary) => {
                                    const bsc = BID_STATUS_CONFIG[bid.status] ?? { label: bid.status, className: "bg-muted text-muted-foreground border-border" };
                                    return (
                                        <div key={bid.id} className="flex items-center justify-between gap-4 p-3 rounded-lg border border-border bg-muted/30">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <span className="size-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 bg-primary text-primary-foreground">
                                                    {bid.freelancerName.charAt(0).toUpperCase()}
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-foreground truncate max-w-40">
                                                        {bid.freelancerName}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground font-mono">
                                                        {format(new Date(bid.createdAt), "MMM dd, yyyy")}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <span className="text-sm font-semibold text-foreground">
                                                    ${bid.amount.toLocaleString()}
                                                </span>
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border uppercase tracking-wide ${bsc.className}`}>
                                                    {bsc.label}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Section>

                    {/* Contract */}
                    {project.contract && (
                        <Section title="Active contract" icon={Wallet}>
                            {(() => {
                                const c: ContractSummary = project.contract;
                                return (
                                    <div className="space-y-0.5">
                                        <InfoRow label="Contract ID">
                                            <span className="font-mono text-xs">{c.id.slice(0, 12)}…</span>
                                        </InfoRow>
                                        <InfoRow label="Status">
                                            <span className="text-xs font-medium text-foreground uppercase">{c.status}</span>
                                        </InfoRow>
                                        <InfoRow label="Freelancer">
                                            <span>{c.freelancerName}</span>
                                        </InfoRow>
                                        <InfoRow label="Agreed price">
                                            <span className="font-semibold">${c.agreedPrice.toLocaleString()}</span>
                                        </InfoRow>
                                        {c.startDate && (
                                            <InfoRow label="Started">
                                                <span>{format(new Date(c.startDate), "MMM dd, yyyy")}</span>
                                            </InfoRow>
                                        )}
                                    </div>
                                );
                            })()}
                        </Section>
                    )}
                </div>

                {/* ── Right col: Client & moderation ─────────────────────── */}
                <div className="space-y-5">

                    {/* Client */}
                    <Section title="Client" icon={User}>
                        <div className="flex items-center gap-3">
                            <span className="size-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 bg-primary text-primary-foreground">
                                {project.clientName.charAt(0).toUpperCase()}
                            </span>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">{project.clientName}</p>
                                <p className="text-xs text-muted-foreground truncate">{project.clientEmail}</p>
                            </div>
                        </div>
                        <div className="mt-2 pt-3 border-t border-border space-y-0.5">
                            <InfoRow label="Client ID">
                                <span className="font-mono text-xs text-muted-foreground">{project.clientId.slice(0, 12)}…</span>
                            </InfoRow>
                        </div>
                    </Section>

                    {/* Moderation flags */}
                    <Section title="Moderation" icon={Tag}>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Flagged</span>
                                <span className={`text-xs font-semibold ${project.flagged ? "text-destructive" : "text-success"}`}>
                                    {project.flagged ? "Yes" : "No"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Featured</span>
                                <span className={`text-xs font-semibold ${project.featured ? "text-warning" : "text-muted-foreground"}`}>
                                    {project.featured ? "Yes" : "No"}
                                </span>
                            </div>
                        </div>
                        {project.adminNote && (
                            <div className="mt-2 pt-3 border-t border-border">
                                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Admin note</p>
                                <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{project.adminNote}</p>
                            </div>
                        )}
                    </Section>

                    {/* Quick stats */}
                    <Section title="Quick stats" icon={Clock}>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Total bids</span>
                                <span className="text-sm font-semibold text-foreground">{project.bidCount}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Has contract</span>
                                <span className="text-sm font-semibold text-foreground">{project.contract ? "Yes" : "No"}</span>
                            </div>
                        </div>
                    </Section>
                </div>
            </div>

            {/* ── Dialogs ───────────────────────────────────────────────────── */}

            {/* Status */}
            <ConfirmDialog
                open={showStatusDialog}
                onCancel={() => setShowStatusDialog(false)}
                onConfirm={handleStatusConfirm}
                title="Change Project Status"
                description={
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Current: <StatusBadge status={project.status} />
                        </p>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-foreground tracking-wide uppercase">
                                New status <span className="text-destructive">*</span>
                            </label>
                            <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                                <option value="" disabled>Select new status…</option>
                                {PROJECT_STATUSES.filter((s) => s !== project.status).map((s) => (
                                    <option key={s} value={s}>{STATUS_CONFIG[s]?.label ?? s}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-foreground tracking-wide uppercase">
                                Reason <span className="text-destructive">*</span>
                            </label>
                            <Textarea
                                placeholder="Reason for this status change…"
                                value={statusReason}
                                rows={3}
                                className={`resize-none text-sm ${statusReasonError ? "border-destructive ring-1 ring-destructive/30" : ""}`}
                                onChange={(e) => { setStatusReason(e.target.value); if (e.target.value.trim()) setStatusReasonError(false); }}
                            />
                            {statusReasonError && (
                                <p className="flex items-center gap-1.5 text-xs text-destructive">
                                    <AlertCircle className="size-3 shrink-0" /> A reason is required.
                                </p>
                            )}
                        </div>
                    </div>
                }
                confirmLabel="Confirm Change"
                variant="default"
            />

            {/* Flag */}
            <ConfirmDialog
                open={showFlagDialog}
                onCancel={() => setShowFlagDialog(false)}
                onConfirm={handleFlagConfirm}
                title={project.flagged ? "Clear Project Flag" : "Flag Project for Review"}
                description={
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {project.flagged
                                ? "The flag will be cleared and the project will resume normal visibility."
                                : "This project will be marked as suspicious and may be hidden from search."}
                        </p>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-foreground tracking-wide uppercase">
                                Reason <span className="text-destructive">*</span>
                            </label>
                            <Textarea
                                placeholder={project.flagged ? "Why is the flag being cleared?" : "Why is this project being flagged?"}
                                value={flagReason}
                                rows={3}
                                className={`resize-none text-sm ${flagReasonError ? "border-destructive ring-1 ring-destructive/30" : ""}`}
                                onChange={(e) => { setFlagReason(e.target.value); if (e.target.value.trim()) setFlagReasonError(false); }}
                            />
                            {flagReasonError && (
                                <p className="flex items-center gap-1.5 text-xs text-destructive">
                                    <AlertCircle className="size-3 shrink-0" /> A reason is required.
                                </p>
                            )}
                        </div>
                    </div>
                }
                confirmLabel={project.flagged ? "Clear Flag" : "Flag Project"}
                variant={project.flagged ? "default" : "destructive"}
            />

            {/* Delete */}
            <ConfirmDialog
                open={showDeleteDialog}
                onCancel={() => setShowDeleteDialog(false)}
                onConfirm={handleDeleteConfirm}
                title="Force Delete Project"
                description={
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            This will <span className="text-foreground font-medium">soft-delete</span> the project and write an audit log entry. This cannot be undone.
                        </p>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-foreground tracking-wide uppercase">
                                Deletion reason <span className="text-destructive">*</span>
                            </label>
                            <Textarea
                                placeholder="Describe the compliance reason for this deletion…"
                                value={deleteReason}
                                rows={3}
                                className={`resize-none text-sm ${deleteReasonError ? "border-destructive ring-1 ring-destructive/30" : ""}`}
                                onChange={(e) => { setDeleteReason(e.target.value); if (e.target.value.trim()) setDeleteReasonError(false); }}
                            />
                            {deleteReasonError && (
                                <p className="flex items-center gap-1.5 text-xs text-destructive">
                                    <AlertCircle className="size-3 shrink-0" /> A reason is required.
                                </p>
                            )}
                        </div>
                    </div>
                }
                confirmLabel="Delete Project"
                variant="destructive"
            />
        </>
    );
}