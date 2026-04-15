"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

import { Button } from "@/modules/shared/components/button";
import { ConfirmDialog } from "@/modules/shared/components/ConfirmDialog";
import { parseApiError } from "@/modules/shared";

import { useCancelContract } from "../../shared/hooks/contract.shared.useCancelContract";
import { useDisputeContract } from "../../shared/hooks/contract.shared.useDisputeContract";
import { useCompleteContract } from "../hooks/contract.client.useCompleteContract";

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

export function ClientContractHeaderActions({ contractId }: { contractId: string }) {
    const { mutate: complete, isPending: completing } = useCompleteContract();
    const { mutate: cancel, isPending: cancelling } = useCancelContract();
    const { mutate: dispute, isPending: disputing } = useDisputeContract();

    const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>(CLOSED_DIALOG);

    const isActionPending = completing || cancelling || disputing;

    const openDialog = (dialog: Omit<ConfirmDialogState, "open">) => setConfirmDialog({ open: true, ...dialog });
    const closeDialog = () => setConfirmDialog(CLOSED_DIALOG);

    const handleCompleteContract = () => {
        openDialog({
            variant: "success",
            title: "Mark Contract as Complete?",
            description: "This will mark the contract as completed. The freelancer will be notified and you'll be asked to leave a review.",
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

    const handleDisputeContract = () => {
        openDialog({
            variant: "warning",
            title: "Open a Dispute?",
            description: "This will flag the contract for mediation. Our team will review the situation and contact both parties.",
            confirmLabel: "Yes, open dispute",
            action: (e) => {
                e?.preventDefault();
                dispute(contractId, {
                    onSuccess: () => {
                        toast.info("Dispute opened. Our team will follow up.");
                        closeDialog();
                    },
                    onError: (err) => toast.error(parseApiError(err)),
                });
            },
        });
    };

    const handleCancelContract = () => {
        openDialog({
            variant: "destructive",
            title: "Cancel Contract?",
            description: "This action cannot be undone. The contract will be permanently cancelled.",
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

    return (
        <>
            <div className="flex gap-2 shrink-0 flex-wrap">
                <Button variant="success" disabled={isActionPending} loading={completing} onClick={handleCompleteContract}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                </Button>

                <Button
                    variant="outline"
                    disabled={isActionPending}
                    loading={disputing}
                    onClick={handleDisputeContract}
                    className="text-warning border-warning/30 hover:bg-warning/8 dark:border-warning/40"
                >
                    <AlertTriangle className="w-3.5 h-3.5" /> Dispute
                </Button>

                <Button variant="destructive" disabled={isActionPending} loading={cancelling} onClick={handleCancelContract}>
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
        </>
    );
}