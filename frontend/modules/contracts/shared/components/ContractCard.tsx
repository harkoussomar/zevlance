"use client";

import Link from "next/link";
import { Users, Calendar, ArrowRight, ShieldAlert } from "lucide-react";

import { Card, CardContent } from "@/modules/shared/components/card";
import { Progress } from "@/modules/shared/components/progress";
import { SmartAvatar } from "@/modules/shared/components/avatar";
import { ContractStatusBadge } from "@/modules/shared/components/status-badge";
import { formatCurrency, formatDate, percentage, ROLE_REDIRECT } from "@/modules/shared";
import { selectRole, useAuthStore } from "@/store/auth-store";

import type { ContractResponse } from "../types/contract.shared";

interface ContractCardProps {
    contract: ContractResponse;
}

export function ContractCard({ contract }: ContractCardProps) {
    const role = useAuthStore(selectRole);
    const isClient = role === "CLIENT";
    const basePath = role ? ROLE_REDIRECT[role] : "/";

    const totalCount = contract.totalMilestones;
    const approvedCount = contract.approvedMilestones;

    const totalPaid = isClient
        ? contract.clientTotalReleased
        : contract.freelancerTotalEarned;

    const pct = percentage(approvedCount, totalCount);

    const isDisputed = contract.status === "DISPUTED";

    return (
        <Link href={`${basePath}/contracts/${contract.id}`}>
            <Card
                className={[
                    "group hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer h-full flex flex-col overflow-hidden p-0",
                    isDisputed
                        ? "border-warning/60 shadow-[0_0_0_1px_hsl(var(--warning)/0.25)] bg-warning/[0.03]"
                        : "",
                ].join(" ")}
            >
                {/* ── Disputed banner strip ─────────────────────────────────── */}
                {isDisputed && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-warning/10 border-b border-warning/25">
                        <ShieldAlert className="w-3.5 h-3.5 text-warning shrink-0" />
                        <p className="text-xs font-semibold text-warning tracking-wide">
                            Under Dispute — Funds Frozen
                        </p>
                    </div>
                )}

                <CardContent className="p-5 flex flex-col h-full">

                    {/* ─── Header ─────────────────────────────────────────────── */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="min-w-0">
                            <p
                                className={[
                                    "font-bold text-sm leading-snug line-clamp-2 transition-colors",
                                    isDisputed
                                        ? "text-foreground"
                                        : "text-foreground group-hover:text-primary",
                                ].join(" ")}
                            >
                                {contract.projectTitle}
                            </p>
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5 truncate">
                                    <Users className="w-3 h-3 shrink-0" />
                                    <span className="truncate">
                                        {isClient
                                            ? contract.freelancerName
                                            : contract.clientName}
                                    </span>
                                </span>
                                <span className="text-muted-foreground/50 shrink-0">·</span>
                                <span className="flex items-center gap-1.5 shrink-0">
                                    <Calendar className="w-3 h-3" />
                                    Started {formatDate(contract.startDate)}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <ContractStatusBadge status={contract.status} />
                            <ArrowRight
                                className={[
                                    "w-4 h-4 mt-1 transition-colors",
                                    isDisputed
                                        ? "text-warning/50"
                                        : "text-muted-foreground/40 group-hover:text-primary",
                                ].join(" ")}
                            />
                        </div>
                    </div>

                    {/* ─── Financial Summary ──────────────────────────────────── */}
                    <div className="grid grid-cols-2 gap-4 py-3 border-y border-border mb-4">
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">
                                Agreed Price
                            </p>
                            <p className="font-bold text-foreground">
                                {formatCurrency(contract.agreedPrice)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">
                                {isClient ? "Paid Out" : "Earned"}
                            </p>
                            <p
                                className={[
                                    "font-bold",
                                    isDisputed ? "text-warning" : "text-success",
                                ].join(" ")}
                            >
                                {formatCurrency(totalPaid)}
                                {isDisputed && (
                                    <span className="ml-1.5 text-[10px] font-semibold text-warning/70 normal-case">
                                        frozen
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* ─── Milestones Progress ────────────────────────────────── */}
                    <div className="flex-1">
                        {totalCount > 0 ? (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground font-medium">
                                        Milestones
                                    </span>
                                    <span className="font-semibold text-foreground">
                                        {approvedCount}/{totalCount} approved
                                    </span>
                                </div>
                                <Progress
                                    value={pct}
                                    showLabel
                                    className={isDisputed ? "[&>div]:bg-warning" : ""}
                                />

                                {isDisputed ? (
                                    <p className="text-xs text-warning/80 font-medium pt-1">
                                        All actions paused during review
                                    </p>
                                ) : (
                                    contract.status === "ACTIVE" &&
                                    approvedCount < totalCount && (
                                        <div className="flex items-center justify-between pt-1 mt-2">
                                            <p className="text-xs text-muted-foreground truncate mr-2">
                                                {contract.pendingReviewCount > 0 ? (
                                                    <span className="font-medium text-foreground">
                                                        {contract.pendingReviewCount} milestone(s) awaiting review
                                                    </span>
                                                ) : (
                                                    "Next milestone pending"
                                                )}
                                            </p>
                                            {contract.pendingReviewCount > 0 && (
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 bg-info/10 text-info">
                                                    Action Required
                                                </span>
                                            )}
                                        </div>
                                    )
                                )}
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground italic">
                                No milestones defined yet.
                            </p>
                        )}
                    </div>

                    {/* ─── Parties ────────────────────────────────────────────── */}
                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-border shrink-0">
                        <div className="flex items-center gap-2 max-w-[45%]">
                            <SmartAvatar name={contract.clientName} size="xs" />
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-foreground truncate">
                                    {contract.clientName}
                                </p>
                                <p className="text-[10px] text-muted-foreground">Client</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 max-w-[45%] text-right">
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-foreground truncate">
                                    {contract.freelancerName}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                    Freelancer
                                </p>
                            </div>
                            <SmartAvatar name={contract.freelancerName} size="xs" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}