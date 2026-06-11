"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Layers, X } from "lucide-react";

import { Button } from "@/modules/shared/components/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/modules/shared/components/card";
import { Progress } from "@/modules/shared/components/progress";
import { EmptyState } from "@/modules/shared/components/empty-state";
import { SkeletonCard } from "@/modules/shared/components/skeleton";

import { parseApiError, percentage } from "@/modules/shared";
import {
    AddMilestoneForm,
    ClientMilestoneCard,
    useCreateMilestone,
} from "@/modules/milestone/client";

import type { ContractResponse } from "../../shared";
import type { MilestoneResponse } from "@/modules/milestone/shared";

interface ClientContractMilestonesProps {
    contractId: string;
    isActive: boolean;
    contract: ContractResponse;
    milestones: MilestoneResponse[];
    isPending: boolean;
    isError: boolean;
}

export function ClientContractMilestones({
    contractId,
    isActive,
    contract,
    milestones,
    isPending,
    isError,
}: ClientContractMilestonesProps) {
    const [showAddMilestone, setShowAddMilestone] = useState(false);

    // Parent ONLY handles creating new milestones. Cards handle themselves.
    const {
        mutate: createMilestone,
        isPending: creatingMilestone,
        error: createMilestoneError,
    } = useCreateMilestone(contractId);

    const approvedMilestones = milestones.filter((m) => m.status === "APPROVED");
    const pct = percentage(approvedMilestones.length, milestones.length);
    const allocatedAmount = milestones.reduce((sum, m) => sum + m.amount, 0);
    const lastMilestoneDueDate =
        milestones.length > 0
            ? milestones[milestones.length - 1].dueDate
            : null;

    const createMilestoneServerError = createMilestoneError
        ? parseApiError(createMilestoneError)
        : null;

    const handleAddMilestone = (
        payload: Parameters<typeof createMilestone>[0],
    ) => {
        createMilestone(payload, {
            onSuccess: () => {
                setShowAddMilestone(false);
                toast.success("Milestone added");
            },
        });
    };

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
            {/* Progress card with Add Milestone toggle */}
            <Card>
                <CardContent className="p-4 md:p-5">
                    {/*
                     * Header row layout strategy:
                     *
                     * Mobile (< 640px): the milestone label + count and the
                     * "Add" button must coexist in a single row without
                     * truncating either. We cap the label group with min-w-0
                     * and let it shrink, while the button stays fixed.
                     *
                     * The button text collapses to icon-only on xs via
                     * responsive text classes to reclaim horizontal space.
                     */}
                    <div className="flex items-center justify-between gap-3 mb-3 md:mb-4">
                        <div className="flex items-center gap-2 min-w-0 flex-wrap">
                            <Layers className="w-4 h-4 text-muted-foreground shrink-0" />
                            <h2 className="font-semibold text-foreground text-sm whitespace-nowrap">
                                Milestones
                            </h2>
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                                ({approvedMilestones.length}/{milestones.length}{" "}
                                approved)
                            </span>
                        </div>

                        {isActive && (
                            <Button
                                variant={showAddMilestone ? "ghost" : "outline"}
                                size="sm"
                                onClick={() =>
                                    setShowAddMilestone((s) => !s)
                                }
                                className="shrink-0"
                                aria-expanded={showAddMilestone}
                                aria-label={
                                    showAddMilestone
                                        ? "Close add milestone form"
                                        : "Add milestone"
                                }
                            >
                                {showAddMilestone ? (
                                    <>
                                        {/* Icon-only on xs, text on sm+ */}
                                        <X className="w-3.5 h-3.5 sm:mr-1.5" />
                                        <span className="hidden sm:inline">
                                            Close
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-3.5 h-3.5 sm:mr-1.5" />
                                        <span className="hidden sm:inline">
                                            Add Milestone
                                        </span>
                                    </>
                                )}
                            </Button>
                        )}
                    </div>

                    <Progress value={pct} barClassName="bg-success" />
                    {milestones.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-2">
                            {pct}% complete
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Add Milestone form — slides in below the progress card */}
            {showAddMilestone && (
                <Card>
                    <CardHeader className="pb-2 pt-4 px-4 md:pt-5 md:px-5">
                        <CardTitle className="text-sm">New Milestone</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 md:px-5 md:pb-5">
                        <AddMilestoneForm
                            isPending={creatingMilestone}
                            serverError={createMilestoneServerError}
                            onAdd={handleAddMilestone}
                            onCancel={() => setShowAddMilestone(false)}
                            agreedPrice={contract.agreedPrice}
                            allocatedAmount={allocatedAmount}
                            contractEndDate={contract.endDate ?? null}
                            lastMilestoneDueDate={lastMilestoneDueDate}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Milestone list or empty state */}
            {milestones.length === 0 ? (
                <Card>
                    <CardContent className="p-0">
                        <EmptyState
                            icon={<Layers className="w-6 h-6" />}
                            title="No milestones yet"
                            description="Break the project into milestones so both parties stay aligned on deliverables and payments."
                            action={
                                isActive && (
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            setShowAddMilestone(true)
                                        }
                                    >
                                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                                        Add First Milestone
                                    </Button>
                                )
                            }
                        />
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {milestones.map((ms, i) => (
                        <ClientMilestoneCard
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