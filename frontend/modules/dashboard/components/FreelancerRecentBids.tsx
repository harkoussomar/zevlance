import Link from "next/link";
import { BidStatusBadge } from "@/modules/shared/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/components/card";
import type { DashboardBidItem } from "../types";
import { formatCurrency } from "@/modules/shared";

interface Props {
    bids: DashboardBidItem[];
}

export function FreelancerRecentBids({ bids }: Props) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Recent Bids</CardTitle>
                    <Link href="/freelancer/bids" className="text-xs text-primary font-semibold hover:underline">
                        View all
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="pt-0 px-0 pb-0">
                {bids.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8 px-5">
                        No bids submitted yet.
                    </p>
                ) : (
                    bids.map((bid) => (
                        <div
                            key={bid.id}
                            className="flex items-center justify-between px-5 py-3 border-b border-border last:border-b-0"
                        >
                            <div className="min-w-0 mr-3">
                                <p className="text-sm font-medium text-foreground truncate max-w-40">
                                    {bid.projectTitle}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {formatCurrency(bid.proposedPrice)} · {bid.estimatedDays}d
                                </p>
                            </div>
                            <BidStatusBadge status={bid.status} />
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}