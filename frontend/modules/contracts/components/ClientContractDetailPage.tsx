// ─── features/contracts/components/ClientContractDetailPage.tsx ───────────────

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
    ArrowLeft,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Plus,
    Layers,
    Star,
    Minus,
} from "lucide-react";

import { Button } from "@/modules/shared/components/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/modules/shared/components/card";
import { Progress } from "@/modules/shared/components/progress";
import { Separator } from "@/modules/shared/components/separator";
import { SkeletonCard } from "@/modules/shared/components/skeleton";
import { EmptyState } from "@/modules/shared/components/empty-state";
import { Alert } from "@/modules/shared/components/alert";
import { ContractStatusBadge } from "@/modules/shared/components/status-badge";

import {
    useContract,
    useCompleteContract,
    useCancelContract,
    useDisputeContract,
} from "../hooks/useContract";

import { ConfirmActionDialog } from "./ConfirmActionDialog";
import { ContractSidebar } from "./ContractSidebar";

import type { ConfirmDialogState } from "../types";
import { useLeaveReview } from "@/modules/review/hooks/useReview";
import { ReviewForm } from "@/modules/review/components/ReviewForm";
import {
    useApproveMilestone,
    useContractMilestones,
    useCreateMilestone,
    /* useDeleteMilestone, */
    useRequestRevision,
} from "@/modules/milestone/hooks/useMilestone";
import { AddMilestoneForm } from "@/modules/milestone/components/AddMilestoneForm";
import { ClientMilestoneCard } from "@/modules/milestone/components/ClientMilestoneCard";
import { parseApiError, percentage } from "@/modules/shared";
import {
    useFundMilestone,
    useRefundMilestone,
} from "@/modules/payment/hooks/usePayment";

// ─── Extended confirm dialog state ────────────────────────────────────────────

interface PaymentConfirmDialogState extends ConfirmDialogState {
    milestoneId?: string;
}

interface ClientContractDetailPageProps {
    contractId: string;
}

export function ClientContractDetailPage({
    contractId,
}: ClientContractDetailPageProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // ─── Handle Stripe Checkout return ─────────────────────────────────────────
    useEffect(() => {
        const funded = searchParams.get("funded");
        if (!funded) return;

        if (funded === "true") {
            toast.success(
                "Milestone funded! The freelancer can now begin work.",
            );
        } else {
            toast.error("Payment was cancelled.");
        }

        const clean = window.location.pathname;
        router.replace(clean);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ─── Data fetching ─────────────────────────────────────────────────────────
    const {
        data: contract,
        isPending: contractPending,
        isError: contractError,
    } = useContract(contractId);

    const {
        data: milestones = [],
        isPending: milestonesPending,
        isError: milestonesError,
    } = useContractMilestones(contractId);

    // ─── Mutations ─────────────────────────────────────────────────────────────
    const { mutate: complete, isPending: completing } = useCompleteContract();
    const { mutate: cancel, isPending: cancelling } = useCancelContract();
    const { mutate: dispute, isPending: disputing } = useDisputeContract();

    const {
        mutateAsync: createMilestone,
        isPending: creatingMilestone,
        error: createMilestoneError,
    } = useCreateMilestone(contractId);

    const {
        mutateAsync: approveMilestone,
        isPending: approvingMilestone,
        variables: approvingId,
    } = useApproveMilestone(contractId);

    const {
        mutateAsync: requestRevision,
        isPending: requestingRevision,
        variables: revisionId,
    } = useRequestRevision(contractId);

    const {
        mutate: fundMilestone,
        isPending: fundingMilestone,
        variables: fundingMilestoneId,
    } = useFundMilestone(contractId);

    const {
        mutate: refundMilestone,
        isPending: refundingMilestone,
        variables: refundingMilestoneId,
    } = useRefundMilestone(contractId);

    /* const {
        mutate: deleteMilestone,
        isPending: deletingMilestone,
        variables: deletingMilestoneId,
    } = useDeleteMilestone(contractId); */

    const {
        mutateAsync: leaveReview,
        isPending: submittingReview,
        error: reviewError,
        isSuccess: reviewSuccess,
    } = useLeaveReview(contractId);

    // ─── Local UI state ────────────────────────────────────────────────────────
    const [showAddMilestone, setShowAddMilestone] = useState(false);
    const [confirmDialog, setConfirmDialog] =
        useState<PaymentConfirmDialogState>({
            open: false,
            type: "complete",
            title: "",
            description: "",
        });

    // ─── Loading / error guards ────────────────────────────────────────────────
    if (contractPending) return <SkeletonCard />;

    if (contractError || !contract) {
        return (
            <Alert variant="destructive">
                Failed to load contract. Please refresh the page.
            </Alert>
        );
    }

    // ─── Derived values ────────────────────────────────────────────────────────
    const isActive = contract.status === "ACTIVE";
    const isCompleted = contract.status === "COMPLETED";
    const isActionPending = completing || cancelling || disputing;

    const approvedMilestones = milestones.filter(
        (m) => m.status === "APPROVED",
    );
    const pct = percentage(approvedMilestones.length, milestones.length);

    // Budget tracking — used by the add form
    const allocatedAmount = milestones.reduce((sum, m) => sum + m.amount, 0);

    // Sequential due date ordering — new milestone must come after the last one
    const lastMilestoneDueDate =
        milestones.length > 0
            ? milestones[milestones.length - 1].dueDate
            : null;

    const createMilestoneServerError = createMilestoneError
        ? parseApiError(createMilestoneError)
        : null;
    const reviewServerError = reviewError ? parseApiError(reviewError) : null;

    // ─── Handlers ──────────────────────────────────────────────────────────────

    const openDialog = (
        type: PaymentConfirmDialogState["type"],
        title: string,
        description: string,
        milestoneId?: string,
    ) =>
        setConfirmDialog({ open: true, type, title, description, milestoneId });

    const closeDialog = () => setConfirmDialog((s) => ({ ...s, open: false }));

    const handleContractAction = () => {
        const { type, milestoneId } = confirmDialog;
        closeDialog();

        if (type === "complete") {
            complete(contractId, {
                onSuccess: () => toast.success("Contract marked as completed!"),
                onError: (err) => toast.error(parseApiError(err)),
            });
        } else if (type === "cancel") {
            cancel(contractId, {
                onSuccess: () => toast.success("Contract cancelled"),
                onError: (err) => toast.error(parseApiError(err)),
            });
        } else if (type === "dispute") {
            dispute(contractId, {
                onSuccess: () =>
                    toast.info("Dispute opened. Our team will follow up."),
                onError: (err) => toast.error(parseApiError(err)),
            });
        } else if (type === "fund" && milestoneId) {
            fundMilestone(milestoneId, {
                onError: (err) => {
                    const isAxiosError =
                        err && typeof err === "object" && "response" in err;
                    const status = isAxiosError
                        ? (err as { response?: { status?: number } }).response
                              ?.status
                        : undefined;

                    if (status === 422) {
                        toast.error(
                            "The freelancer hasn't connected their Stripe account yet. They need to complete onboarding in their settings.",
                        );
                    } else if (status === 409) {
                        toast.error(
                            "This milestone cannot be funded in its current state.",
                        );
                    } else {
                        toast.error(parseApiError(err));
                    }
                },
            });
        } else if (type === "refund" && milestoneId) {
            refundMilestone(milestoneId, {
                onSuccess: () =>
                    toast.success("Milestone refunded successfully."),
                onError: (err) => toast.error(parseApiError(err)),
            });
        } /* else if (type === "delete" && milestoneId) {
            deleteMilestone(milestoneId, {
                onSuccess: () => toast.success("Milestone deleted."),
                onError: (err) => toast.error(parseApiError(err)),
            });
        } */
    };

    const handleAddMilestone = async (
        payload: Parameters<typeof createMilestone>[0],
    ) => {
        try {
            await createMilestone(payload);
            setShowAddMilestone(false);
            toast.success("Milestone added");
        } catch {
            // Error surfaced via `createMilestoneServerError` prop
        }
    };

    const handleApprove = async (milestoneId: string) => {
        try {
            await approveMilestone(milestoneId);
            toast.success("Milestone approved!");
        } catch (err) {
            toast.error(parseApiError(err));
        }
    };

    const handleRevision = async (milestoneId: string) => {
        try {
            await requestRevision(milestoneId);
            toast.info("Revision requested. The freelancer will be notified.");
        } catch (err) {
            toast.error(parseApiError(err));
        }
    };

    const handleFund = (milestoneId: string) => {
        const ms = milestones.find((m) => m.id === milestoneId);
        if (!ms) return;
        openDialog(
            "fund",
            "Fund This Milestone?",
            `$${ms.amount.toFixed(2)} will be held securely in escrow. Funds are only released to the freelancer after you approve their work.`,
            milestoneId,
        );
    };

    const handleRefund = (milestoneId: string) => {
        const ms = milestones.find((m) => m.id === milestoneId);
        if (!ms) return;
        openDialog(
            "refund",
            "Refund This Milestone?",
            `This will cancel the milestone and return $${ms.amount.toFixed(2)} to your payment method.`,
            milestoneId,
        );
    };

    const handleDelete = (milestoneId: string) => {
        const ms = milestones.find((m) => m.id === milestoneId);
        if (!ms) return;
        /*  openDialog(
            "delete,
            "Delete This Milestone?",
            `"${ms.title}" hasn't been funded yet. You can remove it if it was created by mistake.`,
            milestoneId,
        ); */
    };

    const handleReviewSubmit = async (
        payload: Parameters<typeof leaveReview>[0],
    ) => {
        try {
            await leaveReview(payload);
            toast.success("Review submitted. Thank you!");
        } catch (err) {
            const isAxiosError =
                err && typeof err === "object" && "response" in err;
            const status = isAxiosError
                ? (err as { response?: { status?: number } }).response?.status
                : undefined;

            if (status === 409) {
                toast.error("You have already reviewed this contract");
            } else {
                toast.error(parseApiError(err));
            }
        }
    };

    // ─── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            <div className="space-y-6">
                <Link
                    href="/client/contracts"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    All Contracts
                </Link>

                {/* ─── Page header ──────────────────────────────────────────────────── */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <ContractStatusBadge status={contract.status} />
                        </div>
                        <h1 className="text-xl font-bold text-foreground leading-tight">
                            {contract.projectTitle}
                        </h1>
                        <p className="text-sm text-muted-foreground font-mono">
                            #{contract.id.slice(0, 8).toUpperCase()}
                        </p>
                    </div>

                    {isActive && (
                        <div className="flex gap-2 shrink-0 flex-wrap">
                            <Button
                                variant="success"
                                disabled={isActionPending}
                                loading={completing}
                                onClick={() =>
                                    openDialog(
                                        "complete",
                                        "Mark Contract as Complete?",
                                        "This will mark the contract as completed. The freelancer will be notified and you'll be asked to leave a review.",
                                    )
                                }
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Complete
                            </Button>

                            <Button
                                variant="outline"
                                disabled={isActionPending}
                                loading={disputing}
                                onClick={() =>
                                    openDialog(
                                        "dispute",
                                        "Open a Dispute?",
                                        "This will flag the contract for mediation. Our team will review the situation and contact both parties.",
                                    )
                                }
                                className="text-amber-600 border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 dark:border-amber-500/40"
                            >
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Dispute
                            </Button>

                            <Button
                                variant="destructive"
                                disabled={isActionPending}
                                loading={cancelling}
                                onClick={() =>
                                    openDialog(
                                        "cancel",
                                        "Cancel Contract?",
                                        "This action cannot be undone. The contract will be permanently cancelled.",
                                    )
                                }
                            >
                                <XCircle className="w-3.5 h-3.5" />
                                Cancel
                            </Button>
                        </div>
                    )}
                </div>

                {/* ─── Main grid ────────────────────────────────────────────────────── */}
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-5">
                        {/* Progress card */}
                        <Card>
                            <CardContent>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Layers className="w-4 h-4 text-muted-foreground" />
                                        <h2 className="font-semibold text-foreground text-sm">
                                            Milestones
                                        </h2>
                                        <span className="text-sm text-muted-foreground">
                                            ({approvedMilestones.length}/
                                            {milestones.length} approved)
                                        </span>
                                    </div>
                                    {isActive && (
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                setShowAddMilestone((s) => !s)
                                            }
                                        >
                                            {showAddMilestone ? (
                                                <>
                                                    <Minus className="w-3.5 h-3.5" />
                                                    Close
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="w-3.5 h-3.5" />
                                                    Add Milestone
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                                <Progress
                                    value={pct}
                                    barClassName="bg-emerald-500"
                                />
                                {milestones.length > 0 && (
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {pct}% complete
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Add milestone form */}
                        {showAddMilestone && (
                            <Card>
                                <CardHeader className="pb-2 pt-5 px-5">
                                    <CardTitle className="text-sm">
                                        New Milestone
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-5 pb-5">
                                    <AddMilestoneForm
                                        isPending={creatingMilestone}
                                        serverError={createMilestoneServerError}
                                        onAdd={handleAddMilestone}
                                        onCancel={() =>
                                            setShowAddMilestone(false)
                                        }
                                        agreedPrice={contract.agreedPrice}
                                        allocatedAmount={allocatedAmount}
                                        contractEndDate={
                                            contract.endDate ?? null
                                        }
                                        lastMilestoneDueDate={
                                            lastMilestoneDueDate
                                        }
                                    />
                                </CardContent>
                            </Card>
                        )}

                        {/* Milestone list */}
                        {milestonesError ? (
                            <Alert variant="destructive">
                                Failed to load milestones. Please refresh.
                            </Alert>
                        ) : milestonesPending ? (
                            <SkeletonCard />
                        ) : milestones.length === 0 ? (
                            <EmptyState
                                icon={<Layers className="w-8 h-8" />}
                                title="No milestones yet"
                                description="Break the project into milestones so both parties stay aligned on deliverables and payments."
                                action={
                                    isActive && (
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                setShowAddMilestone(true)
                                            }
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            Add First Milestone
                                        </Button>
                                    )
                                }
                            />
                        ) : (
                            <div className="space-y-3">
                                {milestones.map((ms, i) => (
                                    <ClientMilestoneCard
                                        key={ms.id}
                                        milestone={ms}
                                        index={i}
                                        isApproving={
                                            approvingMilestone &&
                                            approvingId === ms.id
                                        }
                                        isRequestingRevision={
                                            requestingRevision &&
                                            revisionId === ms.id
                                        }
                                        isFunding={
                                            fundingMilestone &&
                                            fundingMilestoneId === ms.id
                                        }
                                        isRefunding={
                                            refundingMilestone &&
                                            refundingMilestoneId === ms.id
                                        }
                                        /*  isDeleting={
                                            deletingMilestone &&
                                            deletingMilestoneId === ms.id
                                        } */
                                        onApprove={handleApprove}
                                        onRevision={handleRevision}
                                        onFund={handleFund}
                                        onRefund={handleRefund}
                                        onDelete={
                                            isActive ? handleDelete : undefined
                                        }
                                    />
                                ))}
                            </div>
                        )}

                        {/* Review section */}
                        {isCompleted && (
                            <>
                                <Separator />
                                <Card>
                                    <CardHeader className="pb-3 pt-5 px-5">
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <Star className="w-4 h-4 text-muted-foreground" />
                                            Leave a Review
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground">
                                            Rate your experience with{" "}
                                            {contract.freelancerName}
                                        </p>
                                    </CardHeader>
                                    <CardContent className="px-5 pb-5">
                                        <ReviewForm
                                            contractId={contractId}
                                            revieweeName={
                                                contract.freelancerName
                                            }
                                            existingReview={
                                                reviewSuccess ? undefined : null
                                            }
                                            isPending={submittingReview}
                                            serverError={reviewServerError}
                                            onSubmit={handleReviewSubmit}
                                        />
                                    </CardContent>
                                </Card>
                            </>
                        )}
                    </div>

                    <ContractSidebar
                        contract={contract}
                        milestones={milestones}
                        perspective="client"
                    />
                </div>
            </div>

            <ConfirmActionDialog
                open={confirmDialog.open}
                type={confirmDialog.type}
                title={confirmDialog.title}
                description={confirmDialog.description}
                isPending={
                    isActionPending ||
                    fundingMilestone ||
                    refundingMilestone /*  ||
                    deletingMilestone */
                }
                onConfirm={handleContractAction}
                onCancel={closeDialog}
            />
        </>
    );
}
