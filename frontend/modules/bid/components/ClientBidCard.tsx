"use client";

import { useCallback } from "react";
import { format } from "date-fns";
import {
    CheckCircle2,
    XCircle,
    DollarSign,
    CalendarDays,
    User,
    Loader2,
} from "lucide-react";
import { cn, parseApiError } from "@/modules/shared";
import type { BidResponse } from "../types";
import { useAcceptBid, useRejectBid } from "../hooks/useClientBids";
import { Alert, AlertDescription } from "@/modules/shared/components/alert";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/modules/shared/components/alert-dialog";
import { Card, CardContent } from "@/modules/shared/components/card";
import { Button } from "@/modules/shared/components/button";
import { formatCurrency } from "@/modules/shared";

interface ClientBidCardProps {
    bid: BidResponse;
    projectId: string;
}

export function ClientBidCard({ bid, projectId }: ClientBidCardProps) {
    const acceptMutation = useAcceptBid(projectId);
    const rejectMutation = useRejectBid(projectId);

    const isPending = bid.status === "PENDING";
    const isMutating = acceptMutation.isPending || rejectMutation.isPending;

    const actionError =
        (acceptMutation.error ?? rejectMutation.error)
            ? parseApiError(acceptMutation.error ?? rejectMutation.error)
            : null;

    const handleAccept = useCallback(() => {
        acceptMutation.mutate(bid.id);
    }, [acceptMutation, bid.id]);

    const handleReject = useCallback(() => {
        rejectMutation.mutate(bid.id);
    }, [rejectMutation, bid.id]);

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
                {/* Header row */}
                <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="min-w-0">
                        <p className="font-semibold text-foreground flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            {bid.freelancerName}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {format(
                                new Date(bid.submittedAt),
                                "MMM d, yyyy · HH:mm",
                            )}
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

                {/* Cover letter */}
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                    {bid.coverLetter}
                </p>

                {/* Error */}
                {actionError && (
                    <Alert variant="destructive" className="mb-3 py-2">
                        <AlertDescription className="text-xs">
                            {actionError}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Actions — only for PENDING bids */}
                {isPending && (
                    <div className="flex items-center gap-2">
                        {/* Accept */}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                    disabled={isMutating}
                                >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Accept
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Accept this bid?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        You&apos;re about to accept{" "}
                                        <strong>
                                            {bid.freelancerName}&apos;s
                                        </strong>{" "}
                                        bid of{" "}
                                        <strong>
                                            {formatCurrency(bid.proposedPrice)}
                                        </strong>
                                        . This will create a contract and close
                                        the project for new bids.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>

                                    <AlertDialogAction
                                        onClick={handleAccept}
                                        disabled={acceptMutation.isPending}
                                        className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"
                                    >
                                        {acceptMutation.isPending && (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        )}
                                        Accept & Create Contract
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        {/* Reject */}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                                    disabled={isMutating}
                                >
                                    <XCircle className="w-3.5 h-3.5" />
                                    Reject
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Reject this bid?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will notify{" "}
                                        <strong>{bid.freelancerName}</strong>{" "}
                                        that their proposal was not selected.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>

                                    <AlertDialogAction
                                        onClick={handleReject}
                                        disabled={rejectMutation.isPending}
                                        className="bg-destructive hover:bg-destructive/90 flex items-center gap-2"
                                    >
                                        {rejectMutation.isPending && (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        )}
                                        Reject Bid
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                )}

                {bid.status === "ACCEPTED" && (
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Accepted — contract created
                    </p>
                )}
            </CardContent>
        </Card>
    );
}