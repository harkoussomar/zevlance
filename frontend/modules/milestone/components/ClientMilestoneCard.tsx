// ─── features/contracts/components/ClientMilestoneCard.tsx ───────────────────

"use client";

import {
    CheckCircle2,
    RotateCcw,
    Link as LinkIcon,
    ThumbsUp,
    Calendar,
    DollarSign,
    CreditCard,
    RefreshCcw,
    ShieldAlert,
    Undo2,
    BadgeCheck,
    Trash2,
} from "lucide-react";

import { Button } from "@/modules/shared/components/button";
import { MilestoneStatusBadge } from "@/modules/shared/components/status-badge";
import { Tooltip } from "@/modules/shared/components/tooltip";
import { cn } from "@/modules/shared";
import type { MilestoneResponse } from "@/modules/milestone/types";
import { formatCurrency, formatDate } from "@/modules/shared";
import {
    clientStatusStyles,
    ClientStatusIcon,
} from "@/modules/milestone/utils/milestone-status.config";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ClientMilestoneCardProps {
    milestone: MilestoneResponse;
    index: number;
    // Approve / revision
    isApproving: boolean;
    isRequestingRevision: boolean;
    onApprove: (id: string) => void;
    onRevision: (id: string) => void;
    // Fund / refund
    isFunding: boolean;
    isRefunding: boolean;
    onFund: (id: string) => void;
    onRefund: (id: string) => void;
    // Delete (PENDING only)
    isDeleting?: boolean;
    onDelete?: (id: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ClientMilestoneCard({
    milestone,
    index,
    isApproving,
    isRequestingRevision,
    onApprove,
    onRevision,
    isFunding,
    isRefunding,
    onFund,
    onRefund,
    isDeleting = false,
    onDelete,
}: ClientMilestoneCardProps) {
    const styles = clientStatusStyles[milestone.status];

    // ⚠ isActing should be scoped per-milestone at the parent level.
    // If the parent uses a single shared mutation instance across all cards
    // (e.g. one `useApproveMilestone` call for the whole list), then
    // `isApproving` will be true for every card when any one is in-flight.
    // Scope each mutation's loading state to its milestone id in the parent.
    const isActing =
        isApproving ||
        isRequestingRevision ||
        isFunding ||
        isRefunding ||
        isDeleting;

    return (
        <div
            className={cn(
                "rounded-xl border p-5 transition-all duration-200",
                styles.card,
            )}
        >
            {/* ─── Header ──────────────────────────────────────────────────────── */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                    {/* Step bubble */}
                    <div
                        className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border-2 transition-all",
                            styles.dot,
                            milestone.status === "APPROVED"
                                ? "text-white"
                                : "text-muted-foreground",
                        )}
                    >
                        {milestone.status === "APPROVED" ? (
                            <CheckCircle2 className="w-4 h-4" />
                        ) : (
                            index + 1
                        )}
                    </div>

                    {/* Title + meta */}
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <p className="font-semibold text-foreground text-sm leading-snug">
                                {milestone.title}
                            </p>
                            <MilestoneStatusBadge status={milestone.status} />
                        </div>

                        {milestone.description && (
                            <p className="text-xs text-muted-foreground leading-relaxed mb-2.5 line-clamp-2">
                                {milestone.description}
                            </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                <span className="font-semibold text-foreground">
                                    {formatCurrency(milestone.amount)}
                                </span>
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Due {formatDate(milestone.dueDate)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 mt-0.5">
                    {/* Delete button — only for unfunded (PENDING) milestones */}
                    {milestone.status === "PENDING" && onDelete && (
                        <Tooltip content="Delete this milestone">
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={isActing}
                                loading={isDeleting}
                                onClick={() => onDelete(milestone.id)}
                                className="w-7 h-7 text-muted-foreground hover:text-destructive hover:bg-destructive/8"
                            >
                                {!isDeleting && <Trash2 className="w-3.5 h-3.5" />}
                            </Button>
                        </Tooltip>
                    )}
                    <ClientStatusIcon status={milestone.status} />
                </div>
            </div>

            {/* ─── Deliverable link ─────────────────────────────────────────────── */}
            {milestone.deliverableUrl && (
                <div className="mt-3 pt-3 border-t border-border/60">
                    <a
                        href={milestone.deliverableUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-primary hover:underline underline-offset-2 w-fit max-w-full"
                    >
                        <LinkIcon className="w-3 h-3 shrink-0" />
                        <span className="truncate">{milestone.deliverableUrl}</span>
                    </a>
                </div>
            )}

            {/* ─── PENDING: fund button ─────────────────────────────────────────── */}
            {milestone.status === "PENDING" && (
                <div className="mt-4 pt-4 border-t border-border/60">
                    <Tooltip
                        content={`$${milestone.amount} held in escrow until you approve the freelancer's work`}
                    >
                        <Button
                            size="sm"
                            disabled={isActing}
                            loading={isFunding}
                            onClick={() => onFund(milestone.id)}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                        >
                            <CreditCard className="w-3.5 h-3.5" />
                            Fund {formatCurrency(milestone.amount)}
                        </Button>
                    </Tooltip>
                </div>
            )}

            {/* ─── FUNDED: waiting state + refund ──────────────────────────────── */}
            {milestone.status === "FUNDED" && (
                <div className="mt-3 pt-3 border-t border-indigo-500/20 space-y-3">
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                        <BadgeCheck className="w-3 h-3" />
                        Escrow funded
                        {milestone.fundedAt && (
                            <span className="text-muted-foreground">
                                · {formatDate(milestone.fundedAt)}
                            </span>
                        )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Awaiting freelancer submission
                    </p>
                    {/* Refund only when deliverableUrl is still null */}
                    {!milestone.deliverableUrl && (
                        <Tooltip content="Return funds to your payment method and cancel this milestone">
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={isActing}
                                loading={isRefunding}
                                onClick={() => onRefund(milestone.id)}
                                className="text-destructive hover:bg-destructive/5 w-full"
                            >
                                <RefreshCcw className="w-3.5 h-3.5" />
                                Refund {formatCurrency(milestone.amount)}
                            </Button>
                        </Tooltip>
                    )}
                </div>
            )}

            {/* ─── SUBMITTED: approve / revision + payment breakdown ───────────── */}
            {milestone.status === "SUBMITTED" && (
                <>
                    <div className="flex gap-2.5 mt-4 pt-4 border-t border-border/60">
                        <Tooltip content="Approve this deliverable and release payment">
                            <Button
                                size="sm"
                                disabled={isActing}
                                loading={isApproving}
                                onClick={() => onApprove(milestone.id)}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                            >
                                <ThumbsUp className="w-3.5 h-3.5" />
                                Approve & Release
                            </Button>
                        </Tooltip>
                        <Tooltip
                            content={
                                milestone.revisionCount >= 3
                                    ? "Maximum revisions reached — dispute instead"
                                    : `Ask the freelancer to revise (${milestone.revisionCount}/3 used)`
                            }
                        >
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={isActing || milestone.revisionCount >= 3}
                                loading={isRequestingRevision}
                                onClick={() => onRevision(milestone.id)}
                                className="flex-1 text-amber-600 border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 dark:border-amber-500/40"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                {milestone.revisionCount > 0
                                    ? `Revision (${milestone.revisionCount}/3)`
                                    : "Request Revision"}
                            </Button>
                        </Tooltip>
                    </div>

                    {/* Payment breakdown — only render when values are present */}
                    {milestone.freelancerPayout != null &&
                        milestone.platformFeeAmount != null && (
                            <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                                <span>
                                    Freelancer receives{" "}
                                    <span className="font-medium text-foreground">
                                        {formatCurrency(milestone.freelancerPayout)}
                                    </span>
                                </span>
                                <span className="text-border">·</span>
                                <span>
                                    Platform fee{" "}
                                    <span className="font-medium text-foreground">
                                        {formatCurrency(milestone.platformFeeAmount)}
                                    </span>
                                </span>
                            </div>
                        )}
                </>
            )}

            {/* ─── APPROVED: completion state + release timestamp ──────────────── */}
            {milestone.status === "APPROVED" && milestone.releasedAt && (
                <div className="mt-3 pt-3 border-t border-emerald-500/20">
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3" />
                        Payment of{" "}
                        <span className="font-semibold">
                            {formatCurrency(milestone.freelancerPayout)}
                        </span>{" "}
                        released on {formatDate(milestone.releasedAt)}
                    </p>
                </div>
            )}

            {/* ─── DISPUTED: frozen funds ───────────────────────────────────────── */}
            {milestone.status === "DISPUTED" && (
                <div className="mt-3 pt-3 border-t border-destructive/20">
                    <p className="text-xs text-destructive flex items-center gap-1.5">
                        <ShieldAlert className="w-3 h-3" />
                        This milestone is under dispute. Funds are frozen pending review.
                    </p>
                </div>
            )}

            {/* ─── REFUNDED: terminal ───────────────────────────────────────────── */}
            {milestone.status === "REFUNDED" && (
                <div className="mt-3 pt-3 border-t border-border/60">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Undo2 className="w-3 h-3" />
                        Payment of {formatCurrency(milestone.amount)} was refunded.
                    </p>
                </div>
            )}
        </div>
    );
}