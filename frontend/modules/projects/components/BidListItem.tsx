"use client";

import { useState } from "react";
import { Clock, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button, Avatar } from "@/components/ui";
import { BidStatusBadge } from "@/components/shared/status-badge";
import { MOCK_PROJECT_BIDS } from "@/lib/mock-data";
import { formatCurrency, formatRelative, cn } from "@/lib/utils";

type Bid = (typeof MOCK_PROJECT_BIDS)[0];

interface BidListItemProps {
    bid: Bid;
    onAccept: (id: string) => void;
    onReject: (id: string) => void;
}

export function BidListItem({ bid, onAccept, onReject }: BidListItemProps) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div
            className={cn(
                "border border-border rounded-xl overflow-hidden transition-all duration-200",
                bid.status === "ACCEPTED" && "border-emerald-500/40 bg-emerald-500/2",
            )}
        >
            <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <Avatar name={bid.freelancerName} size="md" />
                        <div>
                            <p className="font-bold text-foreground">{bid.freelancerName}</p>
                            <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {bid.estimatedDays} days
                                </span>
                                <span>{formatRelative(bid.submittedAt ?? "")}</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right shrink-0">
                        <div className="text-lg font-bold text-foreground">
                            {formatCurrency(bid.proposedPrice)}
                        </div>
                        <BidStatusBadge status={bid.status} />
                    </div>
                </div>

                {/* Cover letter preview */}
                <div className="mt-3">
                    <p
                        className={cn(
                            "text-sm text-muted-foreground leading-relaxed",
                            !expanded && "line-clamp-2",
                        )}
                    >
                        {bid.coverLetter}
                    </p>
                    <button
                        onClick={() => setExpanded((s) => !s)}
                        className="flex items-center gap-1 text-xs text-primary font-semibold mt-1.5 hover:underline"
                    >
                        {expanded ? (
                            <>
                                <ChevronUp className="w-3 h-3" /> Show less
                            </>
                        ) : (
                            <>
                                <ChevronDown className="w-3 h-3" /> Read full proposal
                            </>
                        )}
                    </button>
                </div>

                {/* Actions */}
                {bid.status === "PENDING" && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                        <Button
                            size="sm"
                            onClick={() => onAccept(bid.id)}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            Accept Bid
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onReject(bid.id)}
                            className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/5"
                        >
                            <ThumbsDown className="w-3.5 h-3.5" />
                            Reject
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}