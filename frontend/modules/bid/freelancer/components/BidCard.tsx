"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
    MinusCircle,
    CalendarDays,
    DollarSign,
    ArrowRight,
} from "lucide-react";
import { cn, parseApiError, formatCurrency } from "@/modules/shared";
import { Badge } from "@/modules/shared/components/badge";
import { Card, CardContent } from "@/modules/shared/components/card";
import { Alert, AlertDescription } from "@/modules/shared/components/alert";
import { Button } from "@/modules/shared/components/button";
import { STATUS_CONFIG } from "../config/status-config";
import type { BidResponse } from "../../shared/types/bid.shared";
import { useWithdrawBid } from "../hooks/bid.freelancer.useWithdrawBid";
import { ConfirmDialog } from "@/modules/shared/components/ConfirmDialog";

interface BidCardProps {
    bid: BidResponse;
}

export function BidCard({ bid }: BidCardProps) {
    const { mutate: withdraw, isPending, error } = useWithdrawBid();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const config = STATUS_CONFIG[bid.status];
    const StatusIcon = config.icon;
    const withdrawError = error ? parseApiError(error) : null;

    // Safe Date Parsing
    const submittedDate = new Date(bid.submittedAt);
    const formattedDate = !isNaN(submittedDate.getTime())
        ? format(submittedDate, "MMM d, yyyy · HH:mm")
        : "Unknown date";

    // Notice we accept the event here to prevent the auto-close
    const handleWithdraw = (e?: React.MouseEvent) => {
        e?.preventDefault();
        
        withdraw(bid.id, {
            onSuccess: () => {
                setIsDialogOpen(false);
            },
        });
    };

    return (
        <Card className="group hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full p-6 relative">
            <CardContent className="p-0">
                {/* ── Header ─────────────────────────────────────────── */}
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="min-w-0">
                        <Link 
                            href={`/projects/${bid.projectId}`}
                            className="font-bold text-foreground hover:text-primary transition-colors text-sm leading-snug line-clamp-2 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
                        >
                            {bid.projectTitle}
                        </Link>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <CalendarDays className="w-3 h-3" />
                                Submitted {formattedDate}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <Badge
                            variant="outline"
                            className={cn(
                                "flex items-center gap-1.5 text-xs font-medium",
                                config.className,
                            )}
                        >
                            <StatusIcon className="w-3 h-3" />
                            {config.label}
                        </Badge>
                        <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                    </div>
                </div>

                {/* ── Financial summary ──────────────────────────────── */}
                <div className="grid grid-cols-2 gap-4 py-3 border-y border-border mb-4">
                    <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Proposed Price</p>
                        <p className="font-bold text-foreground flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                            {formatCurrency(bid.proposedPrice)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Estimated Duration</p>
                        <p className="font-bold text-foreground">
                            {bid.estimatedDays} {bid.estimatedDays === 1 ? "day" : "days"}
                        </p>
                    </div>
                </div>

                {/* ── Cover letter preview ───────────────────────────── */}
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                    {bid.coverLetter}
                </p>

                {/* ── Error ──────────────────────────────────────────── */}
                {withdrawError && (
                    <Alert variant="destructive" className="mb-3 py-2">
                        <AlertDescription className="text-xs">
                            {withdrawError}
                        </AlertDescription>
                    </Alert>
                )}

                {/* ── Footer actions ─────────────────────────────────── */}
                {bid.status === "PENDING" && (
                    <div className="pt-4 border-t border-border">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsDialogOpen(true)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                        >
                            <MinusCircle className="w-3.5 h-3.5" />
                            Withdraw Bid
                        </Button>

                        <ConfirmDialog
                            open={isDialogOpen}
                            variant="destructive"
                            title="Withdraw this bid?"
                            description={
                                <>
                                    You&apos;re about to withdraw your bid on{" "}
                                    <strong className="text-foreground">{bid.projectTitle}</strong>. 
                                    This cannot be undone — you would need to submit a new bid if you change your mind.
                                </>
                            }
                            confirmLabel="Withdraw Bid"
                            isPending={isPending}
                            onCancel={() => setIsDialogOpen(false)}
                            onConfirm={handleWithdraw}
                        />
                    </div>
                )}

                {bid.status === "ACCEPTED" && (
                    <div className="pt-4 border-t border-border">
                        {bid.contractId ? (
                            <Link href={`/freelancer/contracts/${bid.contractId}`}>
                                <Button size="sm" variant="outline">
                                    View Contract
                                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                </Button>
                            </Link>
                        ) : (
                            <p className="text-xs text-muted-foreground italic">
                                Contract generating...
                            </p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}