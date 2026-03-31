import { BidStatusBadge } from "@/components/shared/status-badge";
import { Button, Card, CardContent, Dialog } from "@/components/ui";
import { cn, formatCurrency, formatRelative } from "@/lib/utils";
import { BidResponse, BidStatus } from "@/types";
import { ArrowRight, CheckCircle2, Clock, DollarSign, Link, MinusCircle, XCircle } from "lucide-react";
import { useState } from "react";

export function BidCard({
    bid,
    onWithdraw,
}: {
    bid: BidResponse;
    onWithdraw: (id: string) => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const [withdrawConfirm, setWithdrawConfirm] = useState(false);

    const statusConfig: Record<
        BidStatus,
        { icon: React.ReactNode; border: string; bg: string }
    > = {
        PENDING: {
            icon: <Clock className="w-3.5 h-3.5 text-amber-500" />,
            border: "border-amber-500/20",
            bg: "",
        },
        ACCEPTED: {
            icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
            border: "border-emerald-500/30",
            bg: "bg-emerald-500/2",
        },
        REJECTED: {
            icon: <XCircle className="w-3.5 h-3.5 text-destructive" />,
            border: "border-destructive/20",
            bg: "",
        },
        WITHDRAWN: {
            icon: <MinusCircle className="w-3.5 h-3.5 text-muted-foreground" />,
            border: "",
            bg: "",
        },
    };

    const cfg = statusConfig[bid.status];

    return (
        <>
            <Card
                className={cn(
                    "hover:border-primary/30 hover:shadow-md transition-all duration-200",
                    cfg.border && `border ${cfg.border}`,
                    cfg.bg,
                )}
            >
                <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                        {/* Left info */}
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                {cfg.icon}
                                <BidStatusBadge status={bid.status} />
                                <span className="text-xs text-muted-foreground">
                                    {formatRelative(bid.submittedAt ?? "")}
                                </span>
                            </div>
                            <Link
                                href={`/projects/${bid.projectId}`}
                                className="font-bold text-foreground hover:text-primary transition-colors text-sm leading-snug line-clamp-2 block"
                            >
                                {bid.projectTitle}
                            </Link>

                            {/* Bid terms */}
                            <div className="flex flex-wrap items-center gap-4 mt-3">
                                <div className="flex items-center gap-1.5 text-sm">
                                    <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                                    <span className="font-bold text-foreground">
                                        {formatCurrency(bid.proposedPrice)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <Clock className="w-3.5 h-3.5" />
                                    {bid.estimatedDays} days estimated
                                </div>
                            </div>

                            {/* Cover letter preview */}
                            <div className="mt-3">
                                <p
                                    className={cn(
                                        "text-xs text-muted-foreground leading-relaxed",
                                        !expanded && "line-clamp-2",
                                    )}
                                >
                                    {bid.coverLetter}
                                </p>
                                <button
                                    onClick={() => setExpanded((s) => !s)}
                                    className="text-xs text-primary font-semibold mt-1 hover:underline"
                                >
                                    {expanded
                                        ? "Show less"
                                        : "Read full proposal"}
                                </button>
                            </div>
                        </div>
                        {/* Right actions */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                            <Link href={`/projects/${bid.projectId}`}>
                                <Button variant="ghost" size="sm">
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Button>
                            </Link>
                            {bid.status === "PENDING" && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setWithdrawConfirm(true)}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/5 text-xs"
                                >
                                    Withdraw
                                </Button>
                            )}
                            {bid.status === "ACCEPTED" && (
                                <Link href="/contracts">
                                    <Button size="sm" className="text-xs">
                                        View Contract
                                        <ArrowRight className="w-3 h-3" />
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Withdraw confirm dialog */}
            <Dialog
                open={withdrawConfirm}
                onClose={() => setWithdrawConfirm(false)}
                title="Withdraw Bid?"
                description="This will withdraw your proposal. You won't be able to re-submit to this project."
                size="sm"
            >
                <div className="flex gap-3 mt-2">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setWithdrawConfirm(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        onClick={() => {
                            onWithdraw(bid.id);
                            setWithdrawConfirm(false);
                        }}
                    >
                        Withdraw
                    </Button>
                </div>
            </Dialog>
        </>
    );
}