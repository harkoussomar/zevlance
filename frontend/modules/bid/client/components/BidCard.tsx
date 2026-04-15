"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
    CheckCircle2,
    XCircle,
    DollarSign,
    CalendarDays,
    User,
    ArrowRight,
} from "lucide-react";
import { cn, parseApiError, formatCurrency } from "@/modules/shared";
import { Alert, AlertDescription } from "@/modules/shared/components/alert";
import { Card, CardContent } from "@/modules/shared/components/card";
import { Button } from "@/modules/shared/components/button";
import { ConfirmDialog } from "@/modules/shared/components/ConfirmDialog"; // Ensure correct casing
import { useAcceptBid } from "../hooks/bid.client.useAcceptBid";
import { useRejectBid } from "../hooks/bid.client.useRejectBid";
import type { BidResponse } from "../../shared/types/bid.shared";

interface BidCardProps {
    bid: BidResponse;
    projectId: string;
}

export function BidCard({ bid, projectId }: BidCardProps) {
    const [dialog, setDialog] = useState<"accept" | "reject" | null>(null);

    const { mutate: acceptBid, isPending: isAccepting, error: acceptError } = useAcceptBid(projectId);
    const { mutate: rejectBid, isPending: isRejecting, error: rejectError } = useRejectBid(projectId);

    const isPendingStatus = bid.status === "PENDING";
    const isMutating = isAccepting || isRejecting;

    const rawError = acceptError ?? rejectError;
    const actionError = rawError ? parseApiError(rawError) : null;

    const submittedDate = new Date(bid.submittedAt);
    const formattedDate = !isNaN(submittedDate.getTime())
        ? format(submittedDate, "MMM d, yyyy · HH:mm")
        : "Unknown date";

    // 2. Accept the mouse event, prevent default close, and close on success
    const handleAccept = (e: React.MouseEvent) => {
        e.preventDefault();
        acceptBid(bid.id, {
            onSuccess: () => setDialog(null),
        });
    };

    const handleReject = (e: React.MouseEvent) => {
        e.preventDefault();
        rejectBid(bid.id, {
            onSuccess: () => setDialog(null),
        });
    };

    return (
        <Card
            className={cn(
                "transition-all",
                bid.status === "ACCEPTED" &&
                    "border-emerald-500/30 bg-emerald-500/5",
                bid.status === "REJECTED" && "opacity-60",
            )}
        >
            <CardContent className="p-5">
                {/* ── Header row ─────────────────────────────────────────── */}
                <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="min-w-0">
                        {/* 3. Made the freelancer name a clickable link (assuming you have a profile route) */}
                        <Link
                            href={`/freelancers/${bid.freelancerId}`}
                            className="font-semibold text-foreground flex items-center gap-1.5 hover:text-primary transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm w-fit"
                        >
                            <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            {bid.freelancerName}
                        </Link>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {formattedDate}
                        </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 text-sm">
                        <span className="flex items-center gap-1 font-semibold text-foreground">
                            <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                            {formatCurrency(bid.proposedPrice)}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                            <CalendarDays className="w-3.5 h-3.5" />
                            {bid.estimatedDays}d
                        </span>
                    </div>
                </div>

                {/* ── Cover letter ───────────────────────────────────────── */}
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                    {bid.coverLetter}
                </p>

                {/* ── Error ──────────────────────────────────────────────── */}
                {actionError && (
                    <Alert variant="destructive" className="mb-3 py-2">
                        <AlertDescription className="text-xs">
                            {actionError}
                        </AlertDescription>
                    </Alert>
                )}

                {/* ── Actions (PENDING only) ─────────────────────────────── */}
                {isPendingStatus && (
                    <div className="flex items-center gap-2">
                        {/* Accept Trigger */}
                        <Button
                            size="sm"
                            className="bg-success text-success-foreground hover:bg-success/90"
                            disabled={isMutating}
                            onClick={() => setDialog("accept")}
                        >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Accept
                        </Button>

                        {/* Reject Trigger */}
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                            disabled={isMutating}
                            onClick={() => setDialog("reject")}
                        >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                        </Button>

                        {/* Unified Dialog */}
                        <ConfirmDialog
                            open={dialog !== null}
                            variant={dialog === "accept" ? "success" : "destructive"}
                            title={dialog === "accept" ? "Accept this bid?" : "Reject this bid?"}
                            description={
                                dialog === "accept" ? (
                                    <>
                                        You&apos;re about to accept <strong>{bid.freelancerName}&apos;s</strong>{" "}
                                        bid of <strong>{formatCurrency(bid.proposedPrice)}</strong>.{" "}
                                        This will create a contract and close the project for new bids.
                                    </>
                                ) : (
                                    <>
                                        This will notify <strong>{bid.freelancerName}</strong>{" "}
                                        that their proposal was not selected.
                                    </>
                                )
                            }
                            confirmLabel={dialog === "accept" ? "Accept & Create Contract" : "Reject Bid"}
                            isPending={dialog === "accept" ? isAccepting : isRejecting}
                            onConfirm={dialog === "accept" ? handleAccept : handleReject}
                            onCancel={() => setDialog(null)}
                        />
                    </div>
                )}

                {/* ── Accepted State ─────────────────────────────────────── */}
                {bid.status === "ACCEPTED" && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-emerald-500/20">
                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            Accepted — contract created
                        </p>
                        
                        {/* 4. Optional UI Polish: Provide a link to the generated contract */}
                        {bid.contractId && (
                            <Link href={`/client/contracts/${bid.contractId}`}>
                                <Button size="sm" variant="outline" className="h-8 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400">
                                    View Contract
                                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                </Button>
                            </Link>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}