"use client";

import { useState } from "react";
import Link from "next/link";
import {
    GitBranch,
    Clock,
    DollarSign,
    CheckCircle2,
    XCircle,
    MinusCircle,
    Briefcase,
    Send,
} from "lucide-react";
import { MOCK_MY_BIDS } from "@/lib/mock-data";
import { formatCurrency, cn } from "@/lib/utils";
import {
    Card,
    CardContent,
    Button,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
    EmptyState,
    StatCard,
} from "@/components/ui";
import type { BidStatus } from "@/types";
import { BidCard } from "@/modules/freelancer/bids/components/BidCard";

// ─── Stats ────────────────────────────────────────────────────────────────────

const BID_STATS = [
    {
        status: "PENDING" as BidStatus,
        label: "Pending Review",
        icon: <Clock className="w-4 h-4" />,
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-500/10",
    },
    {
        status: "ACCEPTED" as BidStatus,
        label: "Accepted",
        icon: <CheckCircle2 className="w-4 h-4" />,
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-500/10",
    },
    {
        status: "REJECTED" as BidStatus,
        label: "Rejected",
        icon: <XCircle className="w-4 h-4" />,
        color: "text-destructive",
        bg: "bg-destructive/10",
    },
    {
        status: "WITHDRAWN" as BidStatus,
        label: "Withdrawn",
        icon: <MinusCircle className="w-4 h-4" />,
        color: "text-muted-foreground",
        bg: "bg-muted",
    },
];


export default function BidsPage() {
    const [bids, setBids] = useState(MOCK_MY_BIDS);

    const handleWithdraw = (id: string) => {
        setBids((prev) =>
            prev.map((b) => (b.id === id ? { ...b, status: "WITHDRAWN" } : b)),
        );
    };

    const byStatus = (status: BidStatus | "ALL") =>
        status === "ALL" ? bids : bids.filter((b) => b.status === status);

    const totalValue = bids
        .filter((b) => b.status === "ACCEPTED")
        .reduce((s, b) => s + b.proposedPrice, 0);

    const successRate =
        bids.length > 0
            ? Math.round(
                  (bids.filter((b) => b.status === "ACCEPTED").length /
                      bids.length) *
                      100,
              )
            : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        My Proposals
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {bids.length} total bids submitted
                    </p>
                </div>
                <Link href="/projects">
                    <Button size="sm">
                        <Send className="w-3.5 h-3.5" />
                        Submit New Bid
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {BID_STATS.map((stat) => {
                    const count = bids.filter(
                        (b) => b.status === stat.status,
                    ).length;
                    return (
                        <Card
                            key={stat.status}
                            className="group hover:border-primary/30 hover:shadow-md transition-all"
                        >
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        {stat.label}
                                    </span>
                                    <div
                                        className={cn(
                                            "p-2 rounded-lg transition-colors",
                                            stat.bg,
                                            stat.color,
                                        )}
                                    >
                                        {stat.icon}
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-foreground">
                                    {count}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Quick insights */}
            <div className="grid sm:grid-cols-2 gap-4">
                <StatCard
                    label="Contract Value (Accepted Bids)"
                    value={formatCurrency(totalValue)}
                    icon={<DollarSign className="w-4 h-4" />}
                />
                <StatCard
                    label="Success Rate"
                    value={`${successRate}%`}
                    icon={<CheckCircle2 className="w-4 h-4" />}
                    trend={
                        successRate > 25
                            ? { value: "Above average", positive: true }
                            : undefined
                    }
                />
            </div>

            {/* Tabbed list */}
            <Tabs defaultValue="ALL">
                <TabsList>
                    <TabsTrigger value="ALL" badge={bids.length}>
                        All
                    </TabsTrigger>
                    <TabsTrigger
                        value="PENDING"
                        badge={byStatus("PENDING").length}
                    >
                        Pending
                    </TabsTrigger>
                    <TabsTrigger value="ACCEPTED">Accepted</TabsTrigger>
                    <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
                    <TabsTrigger value="WITHDRAWN">Withdrawn</TabsTrigger>
                </TabsList>

                {(
                    [
                        "ALL",
                        "PENDING",
                        "ACCEPTED",
                        "REJECTED",
                        "WITHDRAWN",
                    ] as const
                ).map((tab) => (
                    <TabsContent key={tab} value={tab}>
                        {byStatus(tab).length === 0 ? (
                            <EmptyState
                                icon={<GitBranch className="w-5 h-5" />}
                                title={`No ${tab === "ALL" ? "" : tab.toLowerCase() + " "}bids`}
                                description={
                                    tab === "ALL"
                                        ? "You haven't submitted any proposals yet."
                                        : `No bids with status: ${tab.toLowerCase()}.`
                                }
                                action={
                                    tab === "ALL" ? (
                                        <Link href="/projects">
                                            <Button size="sm">
                                                <Briefcase className="w-3.5 h-3.5" />
                                                Browse Projects
                                            </Button>
                                        </Link>
                                    ) : undefined
                                }
                            />
                        ) : (
                            <div className="space-y-3">
                                {byStatus(tab).map((bid) => (
                                    <BidCard
                                        key={bid.id}
                                        bid={bid}
                                        onWithdraw={handleWithdraw}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
