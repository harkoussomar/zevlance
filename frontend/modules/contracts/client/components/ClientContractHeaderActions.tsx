"use client";
// contracts/client/components/ClientContractHeaderActions.tsx

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, AlertTriangle, XCircle, ShieldAlert } from "lucide-react";

import { Button } from "@/modules/shared/components/button";
import { ConfirmDialog } from "@/modules/shared/components/ConfirmDialog";
import { parseApiError } from "@/modules/shared";

import { useCancelContract } from "../../shared/hooks/contract.shared.useCancelContract";
import { useDisputeContract } from "../../shared/hooks/contract.shared.useDisputeContract";
import { useCompleteContract } from "../hooks/contract.client.useCompleteContract";
import type { MilestoneResponse } from "@/modules/milestone/shared";
import { FileDisputeDialog } from "../../shared/components/FileDisputeDialog";
import type { FileDisputePayload } from "@/modules/dispute/types/dispute.types";

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface ClientContractHeaderActionsProps {
  contractId: string;
  milestones: MilestoneResponse[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ClientContractHeaderActions({
  contractId,
  milestones,
}: ClientContractHeaderActionsProps) {
  const router = useRouter();
  const { mutate: complete, isPending: completing } = useCompleteContract();
  const { mutate: cancel, isPending: cancelling } = useCancelContract();
  const { mutate: dispute, isPending: disputing } = useDisputeContract();

  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>(CLOSED_DIALOG);
  const [disputeDialogOpen, setDisputeDialogOpen] = useState(false);

  const isActionPending = completing || cancelling || disputing;

  // ─── Derived State ─────────────────────────────────────────────────────────

  // Any milestone actively in dispute — block secondary dispute actions
  const hasActiveDispute = milestones.some((m) => m.status === "DISPUTED");

  // All milestones must be in a terminal / neutral state before completing
  const unresolvedCount = milestones.filter((m) =>
    ["PENDING", "FUNDED", "SUBMITTED", "REVISION_REQUESTED"].includes(m.status)
  ).length;

  // Can't cancel unilaterally when work is in review or disputed
  const lockedCount = milestones.filter((m) =>
    ["SUBMITTED", "REVISION_REQUESTED", "DISPUTED"].includes(m.status)
  ).length;

  // Complete is allowed only when no unresolved milestones remain
  const canComplete = unresolvedCount === 0;

  // Cancel is allowed only when no milestone is locked
  const canCancel = lockedCount === 0;

  // ─── Tooltip Messages ──────────────────────────────────────────────────────

  const completeTooltip = !canComplete
    ? `${unresolvedCount} milestone${unresolvedCount !== 1 ? "s" : ""} still active — approve, refund, or dispute all milestones before completing.`
    : undefined;

  const cancelTooltip = !canCancel
    ? "Work has been submitted or is under dispute. Approve, decline, or resolve it before cancelling."
    : undefined;

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const openDialog = (dialog: Omit<ConfirmDialogState, "open">) =>
    setConfirmDialog({ open: true, ...dialog });
  const closeDialog = () => setConfirmDialog(CLOSED_DIALOG);

  const handleComplete = () => {
    openDialog({
      variant: "success",
      title: "Mark Contract as Complete?",
      description:
        "This will mark the contract as completed. The freelancer will be notified and you'll be prompted to leave a review.",
      confirmLabel: "Yes, complete contract",
      action: (e) => {
        e?.preventDefault();
        complete(contractId, {
          onSuccess: () => {
            toast.success("Contract marked as completed!");
            closeDialog();
          },
          onError: (err) => toast.error(parseApiError(err)),
        });
      },
    });
  };

  const handleViewDispute = () => {
    router.push(`/client/contracts/${contractId}/dispute`);
  };

  const handleFileDispute = () => {
    setDisputeDialogOpen(true);
  };

  const handleCancel = () => {
    openDialog({
      variant: "destructive",
      title: "Cancel Contract?",
      description:
        "This action cannot be undone. The contract will be permanently cancelled and any remaining funded escrows will be returned to your payment method.",
      confirmLabel: "Yes, cancel contract",
      action: (e) => {
        e?.preventDefault();
        cancel(contractId, {
          onSuccess: () => {
            toast.success("Contract cancelled");
            closeDialog();
          },
          onError: (err) => toast.error(parseApiError(err)),
        });
      },
    });
  };

  const handleDisputeConfirm = (payload: FileDisputePayload) => {
    dispute(
      { id: contractId, reason: payload.reason, category: payload.category },
      {
        onSuccess: () => {
          toast.info("Dispute opened — redirecting to the mediation room...");
          setDisputeDialogOpen(false);
          router.push(`/client/contracts/${contractId}/dispute`);
        },
        onError: (err) => toast.error(parseApiError(err)),
      }
    );
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="flex gap-2 shrink-0 flex-wrap items-center">

        {/* Complete */}
        <span title={completeTooltip}>
          <Button
            variant="success"
            disabled={isActionPending || !canComplete}
            loading={completing}
            onClick={handleComplete}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Complete
          </Button>
        </span>

        {/*
         * Dispute / View Dispute
         *
         * If a dispute already exists, show "View Dispute" to navigate there
         * instead of allowing a second dispute to be filed.
         */}
        {hasActiveDispute ? (
          <Button
            variant="outline"
            onClick={handleViewDispute}
            className="text-warning border-warning/40 hover:bg-warning/8"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            View Dispute
          </Button>
        ) : (
          <Button
            variant="outline"
            disabled={isActionPending}
            loading={disputing}
            onClick={handleFileDispute}
            className="text-warning border-warning/30 hover:bg-warning/8 dark:border-warning/40"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Dispute
          </Button>
        )}

        {/* Cancel */}
        <span title={cancelTooltip}>
          <Button
            variant="destructive"
            disabled={isActionPending || !canCancel}
            loading={cancelling}
            onClick={handleCancel}
          >
            <XCircle className="w-3.5 h-3.5" />
            Cancel
          </Button>
        </span>
      </div>

      {/* Confirmation dialog — complete / cancel */}
      <ConfirmDialog
        open={confirmDialog.open}
        variant={confirmDialog.variant}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmLabel={confirmDialog.confirmLabel}
        isPending={isActionPending}
        onConfirm={confirmDialog.action}
        onCancel={closeDialog}
      />

      {/* File Dispute wizard */}
      <FileDisputeDialog
        open={disputeDialogOpen}
        onOpenChange={setDisputeDialogOpen}
        isPending={disputing}
        onConfirm={handleDisputeConfirm}
      />
    </>
  );
}