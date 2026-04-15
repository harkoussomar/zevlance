

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, XCircle } from "lucide-react";

import { Button } from "@/modules/shared/components/button";
import { ConfirmDialog } from "@/modules/shared/components/ConfirmDialog";
import { parseApiError } from "@/modules/shared";

import { useCancelContract } from "../../shared/hooks/contract.shared.useCancelContract";
import { useDisputeContract } from "../../shared/hooks/contract.shared.useDisputeContract";

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

export function FreelancerContractHeaderActions({ contractId }: { contractId: string }) {
    const { mutate: cancel, isPending: cancelling } = useCancelContract();
    const { mutate: dispute, isPending: disputing } = useDisputeContract();

    const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>(CLOSED_DIALOG);

    const isActionPending = cancelling || disputing;

    const openDialog = (dialog: Omit<ConfirmDialogState, "open">) => setConfirmDialog({ open: true, ...dialog });
    const closeDialog = () => setConfirmDialog(CLOSED_DIALOG);

    const handleDispute = () => {
        openDialog({
            variant: "warning",
            title: "Open a Dispute?",
            description: "This will flag the contract for mediation. Our team will review the situation and contact both parties within 48 hours.",
            confirmLabel: "Yes, open dispute",
            action: (e) => {
                e?.preventDefault();
                dispute(contractId, {
                    onSuccess: () => {
                        toast.info("Dispute opened. Our team will follow up.");
                        closeDialog(); // ONLY close on success
                    },
                    onError: (err) => toast.error(parseApiError(err)),
                });
            },
        });
    };

    const handleCancel = () => {
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
                        closeDialog(); // ONLY close on success
                    },
                    onError: (err) => toast.error(parseApiError(err)),
                });
            },
        });
    };

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
                onConfirm={confirmDialog.action} // Action handles its own closure now
                onCancel={closeDialog}
            />
        </>
    );
}