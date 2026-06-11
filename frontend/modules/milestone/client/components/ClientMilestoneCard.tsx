"use client";

import { useState } from "react";
import { toast } from "sonner";
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
} from "lucide-react";

import { Button } from "@/modules/shared/components/button";
import { MilestoneStatusBadge } from "@/modules/shared/components/status-badge";
import { ConfirmDialog } from "@/modules/shared/components/ConfirmDialog";
import {
    cn,
    parseApiError,
    formatCurrency,
    formatDate,
} from "@/modules/shared";
import {
    clientStatusStyles,
    ClientStatusIcon,
} from "../config/milestone.client.status";

import {
    useFundMilestone,
    useRefundMilestone,
} from "@/modules/payment/hooks/usePayment";
import {
    useApproveMilestone,
    useRequestRevision,
} from "@/modules/milestone/client";
import type { MilestoneResponse } from "../../shared";

interface ConfirmDialogState {
    open: boolean;
    variant: "destructive" | "warning" | "success" | "default";
    title: string;
    description: string;
    confirmLabel: string;
    action: (e?: React.MouseEvent) => void;
}

const CLOSED_DIALOG: ConfirmDialogState = {
    open: false,
    variant: "default",
    title: "",
    description: "",
    confirmLabel: "",
    action: () => {},
};

interface ClientMilestoneCardProps {
    contractId: string;
    milestone: MilestoneResponse;
    index: number;
    isActive: boolean;
}

export function ClientMilestoneCard({
    contractId,
    milestone,
    index,
    isActive,
}: ClientMilestoneCardProps) {
    const [confirmDialog, setConfirmDialog] =
        useState<ConfirmDialogState>(CLOSED_DIALOG);

    // ─── Localized Mutations ───────────────────────────────────────────────────
    const { mutate: approve, isPending: isApproving } =
        useApproveMilestone(contractId);

    const { mutate: requestRevision, isPending: isRequestingRevision } =
        useRequestRevision(contractId);

    const { mutate: fund, isPending: isFunding } = useFundMilestone(contractId);

    const { mutate: refund, isPending: isRefunding } =
        useRefundMilestone(contractId);

    const isActing =
        isApproving || isRequestingRevision || isFunding || isRefunding;
    const styles = clientStatusStyles[milestone.status];

    // ─── Dialog Helpers ────────────────────────────────────────────────────────
    const openDialog = (dialog: Omit<ConfirmDialogState, "open">) =>
        setConfirmDialog({ open: true, ...dialog });
    const closeDialog = () => setConfirmDialog(CLOSED_DIALOG);

    // ─── Handlers ─────────────────────────────────────────────────────────────
    const handleApprove = () => {
        approve(milestone.id, {
            onSuccess: () => toast.success("Milestone approved!"),
            onError: (err) => toast.error(parseApiError(err)),
        });
    };

    const handleRevision = () => {
        requestRevision(milestone.id, {
            onSuccess: () =>
                toast.info("Revision requested. The freelancer will be notified."),
            onError: (err) => toast.error(parseApiError(err)),
        });
    };

    const handleFund = () => {
        openDialog({
            variant: "default",
            title: "Fund This Milestone?",
            description: `$${milestone.amount.toFixed(2)} will be held securely in escrow. Funds are only released after you approve their work.`,
            confirmLabel: "Proceed to payment",
            action: (e) => {
                e?.preventDefault();
                fund(milestone.id, {
                    onSuccess: () => closeDialog(),
                    onError: (err) => {
                        const status = (
                            err as { response?: { status?: number } }
                        )?.response?.status;
                        if (status === 422)
                            toast.error("The freelancer hasn't connected their Stripe account yet.");
                        else if (status === 409)
                            toast.error("This milestone cannot be funded in its current state.");
                        else toast.error(parseApiError(err));
                        closeDialog();
                    },
                });
            },
        });
    };

    const handleRefund = () => {
        openDialog({
            variant: "destructive",
            title: "Refund This Milestone?",
            description: `This will cancel the milestone and return $${milestone.amount.toFixed(2)} to your payment method.`,
            confirmLabel: "Yes, refund milestone",
            action: (e) => {
                e?.preventDefault();
                refund(milestone.id, {
                    onSuccess: () => {
                        toast.success("Milestone refunded successfully.");
                        closeDialog();
                    },
                    onError: (err) => {
                        toast.error(parseApiError(err));
                        closeDialog();
                    },
                });
            },
        });
    };

    // ─── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            <div
                className={cn(
                    "rounded-xl border p-4 sm:p-5 transition-all duration-200",
                    styles.card,
                )}
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div
                            className={cn(
                                "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border-2 transition-all",
                                styles.dot,
                                milestone.status === "APPROVED"
                                    ? ""
                                    : "text-muted-foreground",
                            )}
                        >
                            {milestone.status === "APPROVED" ? (
                                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            ) : (
                                index + 1
                            )}
                        </div>

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

                            {/* Meta row — wraps gracefully on xs */}
                            <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3 shrink-0" />
                                    <span className="font-semibold text-foreground">
                                        {formatCurrency(milestone.amount)}
                                    </span>
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 shrink-0" />
                                    Due {formatDate(milestone.dueDate)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Status icon — shrink-safe */}
                    <div className="shrink-0">
                        <ClientStatusIcon status={milestone.status} />
                    </div>
                </div>

                {/* Deliverable Link */}
                {milestone.deliverableUrl && (
                    <div className="mt-3 pt-3 border-t border-border/60">
                        <a
                            href={milestone.deliverableUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs text-primary hover:underline underline-offset-2 w-fit max-w-full"
                        >
                            <LinkIcon className="w-3 h-3 shrink-0" />
                            <span className="truncate">
                                {milestone.deliverableUrl}
                            </span>
                        </a>
                    </div>
                )}

                {/* Actions */}
                {isActive && (
                    <>
                        {/* PENDING -> Fund */}
                        {milestone.status === "PENDING" && (
                            <div className="mt-4 pt-4 border-t border-border/60">
                                <Button
                                    variant="primary"
                                    size="sm"
                                    disabled={isActing}
                                    loading={isFunding}
                                    onClick={handleFund}
                                    className="w-full shadow-sm"
                                >
                                    <CreditCard className="w-3.5 h-3.5 mr-2 shrink-0" />
                                    Fund {formatCurrency(milestone.amount)}
                                </Button>
                            </div>
                        )}

                        {/* FUNDED -> Refund */}
                        {milestone.status === "FUNDED" && (
                            <div className="mt-3 pt-3 border-t border-primary/20 space-y-3">
                                <p className="text-xs text-primary flex items-center gap-1.5">
                                    <BadgeCheck className="w-3 h-3 shrink-0" /> Escrow funded
                                </p>
                                {milestone.refundStatus === "PENDING" && (
                                    <p className="text-xs text-muted-foreground">
                                        Refund initiated and awaiting confirmation from the payment provider.
                                    </p>
                                )}
                                {!milestone.deliverableUrl && milestone.refundStatus === "NONE" && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        disabled={isActing}
                                        loading={isRefunding}
                                        onClick={handleRefund}
                                        className="text-destructive hover:bg-destructive/5 w-full"
                                    >
                                        <RefreshCcw className="w-3.5 h-3.5 mr-2 shrink-0" />
                                        Refund {formatCurrency(milestone.amount)}
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* SUBMITTED -> Approve / Revise */}
                        {milestone.status === "SUBMITTED" && (
                            <div className="flex flex-col gap-2.5 mt-4 pt-4 border-t border-border/60">
                                {milestone.revisionCount >= 3 && (
                                    <p className="text-xs text-warning bg-warning/10 p-2 rounded-md">
                                        Maximum revisions (3/3) reached. You
                                        must now Approve the work or Open a
                                        Dispute.
                                    </p>
                                )}

                                {/* Stack on mobile, side-by-side from sm up */}
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-2.5">
                                    <Button
                                        variant="success"
                                        size="sm"
                                        disabled={isActing}
                                        loading={isApproving}
                                        onClick={handleApprove}
                                        className="flex-1 shadow-sm"
                                    >
                                        <ThumbsUp className="w-3.5 h-3.5 mr-2 shrink-0" />
                                        Approve & Release
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={
                                            isActing ||
                                            milestone.revisionCount >= 3
                                        }
                                        loading={isRequestingRevision}
                                        onClick={handleRevision}
                                        className="flex-1 text-warning border-warning/30 hover:bg-warning/8"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5 mr-2 shrink-0" />
                                        {milestone.revisionCount > 0
                                            ? `Revision (${milestone.revisionCount}/3)`
                                            : "Request Revision"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Terminal States */}
                {milestone.status === "APPROVED" && milestone.releasedAt && (
                    <div className="mt-3 pt-3 border-t border-success/20">
                        <p className="text-xs text-success flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 shrink-0" /> Payment
                            released on {formatDate(milestone.releasedAt)}
                        </p>
                    </div>
                )}
                {milestone.status === "DISPUTED" && (
                    <div className="mt-3 pt-3 border-t border-destructive/20">
                        <p className="text-xs text-destructive flex items-center gap-1.5">
                            <ShieldAlert className="w-3 h-3 shrink-0" /> Under dispute. Funds frozen.
                        </p>
                    </div>
                )}
                {milestone.status === "REFUNDED" && (
                    <div className="mt-3 pt-3 border-t border-border/60">
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Undo2 className="w-3 h-3 shrink-0" /> Payment refunded.
                        </p>
                    </div>
                )}
            </div>

            <ConfirmDialog
                open={confirmDialog.open}
                variant={confirmDialog.variant}
                title={confirmDialog.title}
                description={confirmDialog.description}
                confirmLabel={confirmDialog.confirmLabel}
                isPending={isActing}
                onConfirm={confirmDialog.action}
                onCancel={closeDialog}
            />
        </>
    );
}
