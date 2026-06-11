"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, XCircle } from "lucide-react";

import { Button } from "@/modules/shared/components/button";
import { ConfirmDialog } from "@/modules/shared/components/ConfirmDialog";
import { parseApiError } from "@/modules/shared";

import { useCancelContract } from "../../shared/hooks/contract.shared.useCancelContract";
import { useDisputeContract } from "../../shared/hooks/contract.shared.useDisputeContract";
import { FileDisputeDialog } from "../../shared/components/FileDisputeDialog";

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

interface FreelancerContractHeaderActionsProps {
    contractId: string;
    /**
     * Pass true when the contract already has an open dispute.
     * Both action buttons will be hidden — the DisputeFrozenBanner
     * in the detail page replaces them with a link to the dispute room.
     */
    isDisputed?: boolean;
}

export function FreelancerContractHeaderActions({
    contractId,
    isDisputed = false,
}: FreelancerContractHeaderActionsProps) {
    const { mutate: cancel, isPending: cancelling } = useCancelContract();
    const { mutate: dispute, isPending: disputing } = useDisputeContract();

    const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>(CLOSED_DIALOG);
    const [disputeDialogOpen, setDisputeDialogOpen] = useState(false);

    const isActionPending = cancelling || disputing;

    const openDialog = (dialog: Omit<ConfirmDialogState, "open">) =>
        setConfirmDialog({ open: true, ...dialog });
    const closeDialog = () => setConfirmDialog(CLOSED_DIALOG);

    const handleDispute = () => setDisputeDialogOpen(true);

    const handleCancel = () => {
        openDialog({
            variant: "destructive",
            title: "Cancel Contract?",
            description:
                "This action cannot be undone. The contract will be permanently cancelled.",
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

    // When the contract is already disputed, the detail page renders the
    // DisputeFrozenBanner instead — no header actions are needed.
    if (isDisputed) return null;

    return (
        <>
            <div className="flex gap-2 shrink-0 flex-wrap">
                <Button
                    variant="outline"
                    disabled={isActionPending}
                    loading={disputing}
                    onClick={handleDispute}
                    className="text-warning border-warning/30 hover:bg-warning/8 dark:border-warning/40"
                >
                    <AlertTriangle className="w-3.5 h-3.5" /> Dispute
                </Button>

                <Button
                    variant="ghost"
                    disabled={isActionPending}
                    loading={cancelling}
                    onClick={handleCancel}
                    className="text-destructive hover:bg-destructive/5"
                >
                    <XCircle className="w-3.5 h-3.5" /> Cancel
                </Button>
            </div>

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

            <FileDisputeDialog
                open={disputeDialogOpen}
                onOpenChange={setDisputeDialogOpen}
                isPending={disputing}
                onConfirm={(payload) => {
                    dispute(
                        { id: contractId, ...payload },
                        {
                            onSuccess: () => {
                                toast.info(
                                    "Dispute opened. Redirecting to mediation room...",
                                );
                                setDisputeDialogOpen(false);
                            },
                            onError: (err) => toast.error(parseApiError(err)),
                        },
                    );
                }}
            />
        </>
    );
}
