"use client";

import { Layers, Info } from "lucide-react";

import { Card, CardContent } from "@/modules/shared/components/card";
import { Progress } from "@/modules/shared/components/progress";
import { SkeletonCard } from "@/modules/shared/components/skeleton";
import { EmptyState } from "@/modules/shared/components/empty-state";

import { percentage } from "@/modules/shared";
import { FreelancerMilestoneCard } from "@/modules/milestone/freelancer";
import type { MilestoneResponse } from "@/modules/milestone/shared";

interface FreelancerContractMilestonesProps {
    contractId: string;
    isActive: boolean;
    milestones: MilestoneResponse[];
    isPending: boolean;
    isError: boolean;
}

export function FreelancerContractMilestones({
    contractId,
    isActive,
    milestones,
    isPending,
    isError,
}: FreelancerContractMilestonesProps) {
    const approvedMilestones = milestones.filter((m) => m.status === "APPROVED");
    const pct = percentage(approvedMilestones.length, milestones.length);

    // ─── Guard Returns ─────────────────────────────────────────────────────────
    if (isError) {
        return (
            <Card>
                <CardContent className="p-0">
                    <EmptyState
                        preset="error"
                        title="Failed to load milestones"
                        description="We couldn't retrieve the milestones for this contract. Please refresh the page."
                    />
                </CardContent>
            </Card>
        );
    }

    if (isPending) return <SkeletonCard />;

    // ─── Main Render ───────────────────────────────────────────────────────────
    return (
        <div className="space-y-3 md:space-y-4">
            {/* Milestone progress card */}
            <Card>
                <CardContent className="p-4 md:p-5">
                    {/*
                     * flex-wrap: prevents overflow when the approved count
                     * string is long on narrow screens
                     */}
                    <div className="flex items-center gap-2 mb-3 md:mb-4 flex-wrap">
                        <Layers className="w-4 h-4 text-muted-foreground shrink-0" />
                        <h2 className="font-semibold text-foreground text-sm">
                            Milestones
                        </h2>
                        <span className="text-sm text-muted-foreground">
                            ({approvedMilestones.length}/{milestones.length}{" "}
                            approved)
                        </span>
                    </div>
                    <Progress value={pct} barClassName="bg-success" />
                    {milestones.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-2">
                            {pct}% complete
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Info banner — only shown when contract is active but no milestones */}
            {isActive && milestones.length === 0 && (
                <div className="flex items-start gap-2.5 p-3 md:p-3.5 rounded-lg bg-info/8 border border-info/20 text-sm text-info">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                        The client has not added any milestones yet. Once they
                        do, you&apos;ll be able to submit deliverables here.
                    </p>
                </div>
            )}

            {/* Milestone list */}
            {milestones.length === 0 ? (
                <Card>
                    <CardContent className="p-0">
                        <EmptyState
                            icon={<Layers className="w-8 h-8" />}
                            title="No milestones yet"
                            description="Milestones will appear here once the client adds them to the contract."
                        />
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {milestones.map((ms, i) => (
                        <FreelancerMilestoneCard
                            key={ms.id}
                            contractId={contractId}
                            milestone={ms}
                            index={i}
                            isActive={isActive}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}