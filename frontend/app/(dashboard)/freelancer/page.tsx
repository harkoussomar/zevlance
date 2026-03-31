"use client";

import Link from "next/link";
import {
    ArrowRight,
    Briefcase,
    DollarSign,
    GitBranch,
    Star,
    FileText,
} from "lucide-react";
/* import {
    useCurrentUser,
} from "@/store/auth-store"; */
import {
    MOCK_MY_BIDS,
    MOCK_CONTRACTS,
    MOCK_REVIEWS,
    MOCK_MILESTONES,
} from "@/lib/mock-data";
import { formatCurrency, formatDate, formatRelative } from "@/lib/utils";
import {
    StatCard,
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    Button,
    Avatar,
    Progress,
    StarRating,
} from "@/components/ui";
import {
    BidStatusBadge,
    ContractStatusBadge,
    MilestoneStatusBadge,
} from "@/components/shared/status-badge";

// ─── Freelancer Dashboard ─────────────────────────────────────────────────────

export default function FreelancerDashboard() {
  /*   const user = useCurrentUser(); */
    //const acceptedBid = MOCK_MY_BIDS.find((b) => b.status === "ACCEPTED");
    const pendingBids = MOCK_MY_BIDS.filter((b) => b.status === "PENDING");
    const activeContracts = MOCK_CONTRACTS.filter((c) => c.status === "ACTIVE");
    const completedContracts = MOCK_CONTRACTS.filter(
        (c) => c.status === "COMPLETED",
    );
    const totalEarned = completedContracts.reduce(
        (s, c) => s + c.agreedPrice,
        0,
    );
    const avgRating = MOCK_REVIEWS.length
        ? MOCK_REVIEWS.reduce((s, r) => s + r.rating, 0) / MOCK_REVIEWS.length
        : 0;

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div className="flex items-start justify-between">
                <div>
{/*                     <h1 className="text-2xl font-bold text-foreground">
                        Good morning, {user?.name?.split(" ")[0]} 👋
                    </h1> */}
                    <p className="text-muted-foreground mt-1">
                        Here&apos;s what&apos;s happening with your work today.
                    </p>
                </div>
                <Link href="/projects">
                    <Button size="sm">
                        <Briefcase className="w-3.5 h-3.5" />
                        Find Work
                    </Button>
                </Link>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Earned"
                    value={formatCurrency(totalEarned)}
                    icon={<DollarSign className="w-4 h-4" />}
                    trend={{ value: "+$1,800 this month", positive: true }}
                />
                <StatCard
                    label="Active Contracts"
                    value={activeContracts.length}
                    icon={<FileText className="w-4 h-4" />}
                />
                <StatCard
                    label="Pending Bids"
                    value={pendingBids.length}
                    icon={<GitBranch className="w-4 h-4" />}
                />
                <StatCard
                    label="Avg Rating"
                    value={avgRating.toFixed(1)}
                    icon={<Star className="w-4 h-4" />}
                    trend={{ value: "23 reviews", positive: true }}
                />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Active contract progress */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold text-foreground">
                            Active Contracts
                        </h2>
                        <Link
                            href="/contracts"
                            className="text-sm text-primary font-semibold hover:underline flex items-center gap-1"
                        >
                            View all <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {activeContracts.map((contract) => {
                        const milestones = MOCK_MILESTONES.filter(
                            (m) => m.contractId === contract.id,
                        );
                        const approved = milestones.filter(
                            (m) => m.status === "APPROVED",
                        ).length;
                        const total = milestones.length;
                        const pct = total > 0 ? (approved / total) * 100 : 0;

                        return (
                            <Card
                                key={contract.id}
                                className="hover:border-primary/30 hover:shadow-md transition-all duration-200"
                            >
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div>
                                            <Link
                                                href={`/contracts/${contract.id}`}
                                                className="font-bold text-foreground hover:text-primary transition-colors line-clamp-1"
                                            >
                                                {contract.projectTitle}
                                            </Link>
                                            <p className="text-sm text-muted-foreground mt-0.5">
                                                Client: {contract.clientName}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="font-bold text-foreground">
                                                {formatCurrency(
                                                    contract.agreedPrice,
                                                )}
                                            </div>
                                            <ContractStatusBadge
                                                status={contract.status}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>

                                    {/* Milestones progress */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Milestones progress</span>
                                            <span className="font-semibold">
                                                {approved}/{total} approved
                                            </span>
                                        </div>
                                        <Progress value={pct} showLabel />
                                    </div>

                                    {/* Next milestone */}
                                    {(() => {
                                        const next = milestones.find(
                                            (m) =>
                                                m.status === "PENDING" ||
                                                m.status === "SUBMITTED",
                                        );
                                        return next ? (
                                            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs font-semibold text-foreground">
                                                        {next.title}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Due{" "}
                                                        {formatDate(
                                                            next.dueDate,
                                                        )}
                                                    </p>
                                                </div>
                                                <MilestoneStatusBadge
                                                    status={next.status}
                                                />
                                            </div>
                                        ) : null;
                                    })()}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Right column */}
                <div className="space-y-4">
                    {/* Recent bids */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Recent Bids</CardTitle>
                                <Link
                                    href="/bids"
                                    className="text-xs text-primary font-semibold hover:underline"
                                >
                                    View all
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 px-0 pb-0">
                            {MOCK_MY_BIDS.slice(0, 3).map((bid) => (
                                <div
                                    key={bid.id}
                                    className="flex items-center justify-between px-5 py-3 border-b border-border last:border-b-0 hover:bg-muted/40 transition-colors"
                                >
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate max-w-40">
                                            {bid.projectTitle}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatCurrency(bid.proposedPrice)}{" "}
                                            · {bid.estimatedDays}d
                                        </p>
                                    </div>
                                    <BidStatusBadge status={bid.status} />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Latest reviews */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Latest Reviews</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            {MOCK_REVIEWS.slice(0, 2).map((review) => (
                                <div key={review.id} className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Avatar
                                            name={review.reviewerName}
                                            size="xs"
                                        />
                                        <div>
                                            <p className="text-xs font-semibold text-foreground">
                                                {review.reviewerName}
                                            </p>
                                            <StarRating
                                                rating={review.rating}
                                            />
                                        </div>
                                        <span className="ml-auto text-[10px] text-muted-foreground">
                                            {formatRelative(review.createdAt)}
                                        </span>
                                    </div>
                                    {review.comment && (
                                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 italic">
                                            &ldquo;{review.comment}&rdquo;
                                        </p>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}