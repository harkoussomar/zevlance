// ─── features/contracts/components/FreelancerContractDetailPage.tsx ───────────

"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  AlertTriangle,
  XCircle,
  Layers,
  Star,
  Info,
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
  useCancelContract,
  useDisputeContract,
} from "../hooks/useContract";

import { ConfirmActionDialog } from "./ConfirmActionDialog";
import { ContractSidebar } from "./ContractSidebar";
import { FreelancerMilestoneCard } from "../../milestone/components/FreelancerMilestoneCard";

import type { ConfirmDialogState } from "../types";
import { useLeaveReview } from "@/modules/review/hooks/useReview";
import { ReviewForm } from "@/modules/review/components/ReviewForm";
import {
  useContractMilestones,
  useSubmitDeliverable,
} from "@/modules/milestone/hooks/useMilestone";
import { parseApiError, percentage } from "@/modules/shared";

// ─── Props ────────────────────────────────────────────────────────────────────

interface FreelancerContractDetailPageProps {
  contractId: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FreelancerContractDetailPage({
  contractId,
}: FreelancerContractDetailPageProps) {
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
  const { mutate: cancel, isPending: cancelling } = useCancelContract();
  const { mutate: dispute, isPending: disputing } = useDisputeContract();

  const {
    mutateAsync: submitDeliverable,
    isPending: submittingDeliverable,
    variables: submittingVariables,
  } = useSubmitDeliverable(contractId);

  const {
    mutateAsync: leaveReview,
    isPending: submittingReview,
    error: reviewError,
    isSuccess: reviewSuccess,
  } = useLeaveReview(contractId);

  // ─── Local UI state ────────────────────────────────────────────────────────
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    open: false,
    type: "cancel",
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
  const isActionPending = cancelling || disputing;

  const approvedMilestones = milestones.filter((m) => m.status === "APPROVED");
  const pct = percentage(approvedMilestones.length, milestones.length);

  // Use parseApiError for consistent Spring Boot error extraction
  const reviewServerError = reviewError ? parseApiError(reviewError) : null;

  // Per-card loading state: only the card currently being submitted shows a spinner
  const submittingMilestoneId = submittingDeliverable
    ? submittingVariables?.milestoneId
    : null;

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const openDialog = (
    type: ConfirmDialogState["type"],
    title: string,
    description: string,
  ) => setConfirmDialog({ open: true, type, title, description });

  const closeDialog = () => setConfirmDialog((s) => ({ ...s, open: false }));

  const handleContractAction = () => {
    const { type } = confirmDialog;
    closeDialog();

    // if/else if — actions are mutually exclusive; using if/if would allow
    // multiple branches to run if type comparison ever changes.
    if (type === "cancel") {
      cancel(contractId, {
        onSuccess: () => toast.success("Contract cancelled"),
        onError: (err) => toast.error(parseApiError(err)),
      });
    } else if (type === "dispute") {
      dispute(contractId, {
        onSuccess: () => toast.info("Dispute opened. Our team will follow up."),
        onError: (err) => toast.error(parseApiError(err)),
      });
    }
  };

  const handleSubmitDeliverable = async (
    milestoneId: string,
    deliverableUrl: string,
  ) => {
    try {
      await submitDeliverable({ milestoneId, deliverableUrl });
      toast.success("Deliverable submitted! Awaiting client review.");
    } catch (err) {
      toast.error(parseApiError(err));
    }
  };

  const handleReviewSubmit = async (
    payload: Parameters<typeof leaveReview>[0],
  ) => {
    try {
      await leaveReview(payload);
      toast.success("Review submitted. Thank you!");
    } catch (err) {
      // Check HTTP status (409) rather than matching on error message strings,
      // which are fragile and break if the backend copy changes.
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
        {/* Back navigation */}
        <Link
          href="/freelancer/contracts"
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

          {/* Contract action buttons — visible when ACTIVE */}
          {isActive && (
            <div className="flex gap-2 shrink-0 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                disabled={isActionPending}
                loading={disputing}
                onClick={() =>
                  openDialog(
                    "dispute",
                    "Open a Dispute?",
                    "This will flag the contract for mediation. Our team will review the situation and contact both parties within 48 hours.",
                  )
                }
                className="text-amber-600 border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 dark:border-amber-500/40"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Dispute
              </Button>

              <Button
                variant="ghost"
                size="sm"
                disabled={isActionPending}
                loading={cancelling}
                onClick={() =>
                  openDialog(
                    "cancel",
                    "Cancel Contract?",
                    "This action cannot be undone. The contract will be permanently cancelled.",
                  )
                }
                className="text-destructive hover:bg-destructive/5"
              >
                <XCircle className="w-3.5 h-3.5" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* ─── Main grid ────────────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* ─── Left column ──────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Milestone progress card */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="w-4 h-4 text-muted-foreground" />
                  <h2 className="font-semibold text-foreground text-sm">
                    Milestones
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    ({approvedMilestones.length}/{milestones.length} approved)
                  </span>
                </div>
                <Progress value={pct} barClassName="bg-emerald-500" />
                {milestones.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {pct}% complete
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Info banner for active contracts with no milestones */}
            {isActive && milestones.length === 0 && !milestonesPending && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-blue-500/8 border border-blue-500/20 text-sm text-blue-700 dark:text-blue-400">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  The client has not added any milestones yet. Once they do,
                  you&apos;ll be able to submit deliverables here.
                </p>
              </div>
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
                description="Milestones will appear here once the client adds them to the contract."
              />
            ) : (
              <div className="space-y-3">
                {milestones.map((ms, i) => (
                  <FreelancerMilestoneCard
                    key={`${ms.id}-${ms.deliverableUrl ?? ""}`}
                    milestone={ms}
                    index={i}
                    isSubmitting={
                      submittingDeliverable && submittingMilestoneId === ms.id
                    }
                    onSubmit={handleSubmitDeliverable}
                  />
                ))}
              </div>
            )}

            {/* ─── Review section (completed contracts) ────────────────────── */}
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
                      Rate your experience working with {contract.clientName}
                    </p>
                  </CardHeader>
                  <CardContent className="px-5 pb-5">
                    <ReviewForm
                      contractId={contractId}
                      revieweeName={contract.clientName}
                      existingReview={reviewSuccess ? undefined : null}
                      isPending={submittingReview}
                      serverError={reviewServerError}
                      onSubmit={handleReviewSubmit}
                    />
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* ─── Right column: Sidebar ─────────────────────────────────────── */}
          <ContractSidebar
            contract={contract}
            milestones={milestones}
            perspective="freelancer"
          />
        </div>
      </div>

      {/* Confirm dialog */}
      <ConfirmActionDialog
        open={confirmDialog.open}
        type={confirmDialog.type}
        title={confirmDialog.title}
        description={confirmDialog.description}
        isPending={isActionPending}
        onConfirm={handleContractAction}
        onCancel={closeDialog}
      />
    </>
  );
}