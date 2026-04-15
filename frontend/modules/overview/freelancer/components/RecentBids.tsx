import Link from "next/link";
import { BidStatusBadge } from "@/modules/shared/components/status-badge";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/modules/shared/components/card";
import { ArrowUpRight, Clock } from "lucide-react";
import type { OverviewBidItem } from "../types/overview.freelancer";
import { formatCurrency } from "@/modules/shared";

interface Props {
    bids: OverviewBidItem[];
}

export function RecentBids({ bids }: Props) {
    return (
        <Card className="overflow-hidden gap-0! pb-0 ">
            <CardHeader className="pb-2 border-b border-border/60">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold">
                        Recent Bids
                    </CardTitle>
                    <Link
                        href="/freelancer/bids"
                        className="text-xs text-primary font-semibold hover:underline flex items-center gap-0.5 transition-colors"
                    >
                        View all <ArrowUpRight className="w-3 h-3" />
                    </Link>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                {bids.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 px-5 text-center">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            No bids submitted yet.
                        </p>
                    </div>
                ) : (
                    <div>
                        {bids.map((bid) => (
                            <div
                                key={bid.id}
                                className="flex items-center justify-between p-5 border-b border-border/40 last:border-b-0 hover:bg-muted/30 transition-colors"
                            >
                                <div className="min-w-0 mr-3 flex-1">
                                    <p className="text-sm font-semibold text-foreground truncate">
                                        {bid.projectTitle}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5 tabular-nums">
                                        {formatCurrency(bid.proposedPrice)}
                                        <span className="mx-1 opacity-40">
                                            ·
                                        </span>
                                        {bid.estimatedDays}d delivery
                                    </p>
                                </div>
                                <BidStatusBadge status={bid.status} />
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
