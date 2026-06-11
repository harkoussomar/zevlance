"use client";

import Link from "next/link";
import {
    DollarSign,
    Calendar,
    Users,
    TrendingUp,
    Clock,
    CheckCircle2,
    ExternalLink,
    PieChart,
    AlertCircle,
} from "lucide-react";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/modules/shared/components/card";
import { SmartAvatar } from "@/modules/shared/components/avatar";
import { Separator } from "@/modules/shared/components/separator";
import { Badge } from "@/modules/shared/components/badge";

import { formatCurrency, formatDate } from "@/modules/shared";
import type { ContractResponse } from "../types/contract.shared";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysElapsed(
    startDate: string,
    status: string,
    endDate?: string | null,
): number {
    const start = new Date(startDate).getTime();
    const endTimer =
        (status === "COMPLETED" || status === "CANCELLED") && endDate
            ? new Date(endDate).getTime()
            : Date.now();
    return Math.max(0, Math.floor((endTimer - start) / (1000 * 60 * 60 * 24)));
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

interface StatRowProps {
    label: string;
    value: string;
    valueClassName?: string;
    icon?: React.ElementType;
}

function StatRow({ label, value, valueClassName, icon: Icon }: StatRowProps) {
    return (
        <div className="flex items-center justify-between gap-3 py-2 md:py-2.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
                {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                <span className="truncate">{label}</span>
            </div>
            <span
                className={`text-sm font-semibold text-right shrink-0 ${valueClassName ?? "text-foreground"}`}
            >
                {value}
            </span>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface ContractSidebarProps {
    contract: ContractResponse;
    perspective: "client" | "freelancer";
}

export function ContractSidebar({
    contract,
    perspective,
}: ContractSidebarProps) {
    const isClient = perspective === "client";

    // ─── Financial Calculations using DTO aggregates ───────────────────────────
    const released = isClient
        ? contract.clientTotalReleased
        : contract.freelancerTotalEarned;

    const allocated = contract.totalAllocated;
    const unallocated = Math.max(0, contract.agreedPrice - allocated);

    const approvedCount = contract.approvedMilestones;
    const pendingReviewCount = contract.pendingReviewCount;
    const totalMilestones = contract.totalMilestones;

    const elapsed = daysElapsed(
        contract.startDate,
        contract.status,
        contract.endDate,
    );

    // ─── Render ────────────────────────────────────────────────────────────────
    /*
     * On mobile this sidebar stacks below the milestones area. The cards
     * stay at their natural width (full-width). On md+ this becomes a sticky
     * right column in the parent 3-col grid.
     *
     * Padding scales from p-4 (mobile) to p-5 (md+) inside every card to
     * keep the sidebar feeling tight and scannable on small screens.
     */
    return (
        <div className="space-y-3 md:space-y-4">
            {/* ─── Financial Summary ──────────────────────────────────────────── */}
            <Card>
                <CardHeader className="pb-2 pt-4 px-4 md:pt-5 md:px-5">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground shrink-0" />
                        Financial Summary
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 md:px-5 md:pb-5">
                    <StatRow
                        label="Agreed Price"
                        value={formatCurrency(contract.agreedPrice)}
                        icon={TrendingUp}
                    />
                    <Separator />

                    <StatRow
                        label={
                            isClient ? "Amount Released" : "Earnings Received"
                        }
                        value={formatCurrency(released)}
                        valueClassName="text-success"
                        icon={CheckCircle2}
                    />

                    <StatRow
                        label="Milestone Budget"
                        value={formatCurrency(allocated)}
                        icon={PieChart}
                    />

                    {unallocated > 0 && (
                        <StatRow
                            label="Unallocated"
                            value={formatCurrency(unallocated)}
                            valueClassName="text-warning"
                            icon={AlertCircle}
                        />
                    )}

                    {totalMilestones > 0 && (
                        <>
                            <Separator />
                            <StatRow
                                label="Approved"
                                value={`${approvedCount} / ${totalMilestones}`}
                            />
                            {pendingReviewCount > 0 && (
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-sm text-muted-foreground">
                                        Awaiting review
                                    </span>
                                    <Badge
                                        variant="secondary"
                                        className="bg-info/10 text-info border-info/20"
                                    >
                                        {pendingReviewCount} pending
                                    </Badge>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* ─── Timeline ───────────────────────────────────────────────────── */}
            <Card>
                <CardHeader className="pb-2 pt-4 px-4 md:pt-5 md:px-5">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                        Timeline
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 md:px-5 md:pb-5">
                    <StatRow
                        label="Start Date"
                        value={formatDate(contract.startDate)}
                    />
                    <Separator />
                    <StatRow
                        label="End Date"
                        value={
                            contract.endDate
                                ? formatDate(contract.endDate)
                                : "Ongoing"
                        }
                    />
                    <StatRow
                        label="Duration"
                        value={`${elapsed} day${elapsed !== 1 ? "s" : ""}`}
                        icon={Clock}
                    />
                </CardContent>
            </Card>

            {/* ─── Contract Parties ───────────────────────────────────────────── */}
            <Card>
                <CardHeader className="pb-2 pt-4 px-4 md:pt-5 md:px-5">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground shrink-0" />
                        Parties
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 md:px-5 md:pb-5 space-y-3">
                    {/* Client Row */}
                    <div className="flex items-center justify-between gap-3 min-w-0">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <SmartAvatar
                                name={contract.clientName}
                                size="sm"
                            />
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                    {contract.clientName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Client
                                </p>
                            </div>
                        </div>
                        {isClient && (
                            <Badge
                                variant="outline"
                                className="text-[10px] border-role-client/30 text-role-client bg-role-client/5 shrink-0"
                            >
                                You
                            </Badge>
                        )}
                    </div>

                    <Separator />

                    {/* Freelancer Row */}
                    <div className="flex items-center justify-between gap-3 min-w-0">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <SmartAvatar
                                name={contract.freelancerName}
                                size="sm"
                            />
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                    {contract.freelancerName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Freelancer
                                </p>
                            </div>
                        </div>
                        {!isClient && (
                            <Badge
                                variant="outline"
                                className="text-[10px] border-role-freelancer/30 text-role-freelancer bg-role-freelancer/5 shrink-0"
                            >
                                You
                            </Badge>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* ─── Project Link ───────────────────────────────────────────────── */}
            <Link
                href={`/projects/${contract.projectId}`}
                className="flex items-center justify-between gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-1 py-2.5 rounded-lg hover:bg-muted/50 group min-h-[44px]"
            >
                <span className="truncate">View project listing</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
            </Link>
        </div>
    );
}