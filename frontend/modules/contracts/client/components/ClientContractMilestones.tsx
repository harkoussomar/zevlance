"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Layers, Minus } from "lucide-react";

import { Button } from "@/modules/shared/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/components/card";
import { Progress } from "@/modules/shared/components/progress";
import { EmptyState } from "@/modules/shared/components/empty-state";
import { SkeletonCard } from "@/modules/shared/components/skeleton";

import { parseApiError, percentage } from "@/modules/shared";
import { AddMilestoneForm, ClientMilestoneCard, useCreateMilestone } from "@/modules/milestone/client";

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
    const { mutate: createMilestone, isPending: creatingMilestone, error: createMilestoneError } = useCreateMilestone(contractId);

    const approvedMilestones = milestones.filter((m) => m.status === "APPROVED");
    const pct = percentage(approvedMilestones.length, milestones.length);
    const allocatedAmount = milestones.reduce((sum, m) => sum + m.amount, 0);
    const lastMilestoneDueDate = milestones.length > 0 ? milestones[milestones.length - 1].dueDate : null;
    
    const createMilestoneServerError = createMilestoneError ? parseApiError(createMilestoneError) : null;

    const handleAddMilestone = (payload: Parameters<typeof createMilestone>[0]) => {
        createMilestone(payload, {
            onSuccess: () => {
                setShowAddMilestone(false);
                toast.success("Milestone added");
            }
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
        <div className="space-y-5">
            <Card>
                <CardContent>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-muted-foreground" />
                            <h2 className="font-semibold text-foreground text-sm">
                                Milestones
                            </h2>
                            <span className="text-sm text-muted-foreground">
                                ({approvedMilestones.length}/{milestones.length} approved)
                            </span>
                        </div>
                        {isActive && (
                            <Button variant="outline" onClick={() => setShowAddMilestone((s) => !s)}>
                                {showAddMilestone ? (
                                    <><Minus className="w-3.5 h-3.5 mr-1" /> Close</>
                                ) : (
                                    <><Plus className="w-3.5 h-3.5 mr-1" /> Add Milestone</>
                                )}
                            </Button>
                        )}
                    </div>
                    <Progress value={pct} barClassName="bg-success" />
                    {milestones.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-2">{pct}% complete</p>
                    )}
                </CardContent>
            </Card>

            {showAddMilestone && (
                <Card>
                    <CardHeader className="pb-2 pt-5 px-5">
                        <CardTitle className="text-sm">New Milestone</CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5">
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

            {milestones.length === 0 ? (
                <Card>
                    <CardContent className="p-0">
                        <EmptyState
                            icon={<Layers className="w-6 h-6" />}
                            title="No milestones yet"
                            description="Break the project into milestones so both parties stay aligned on deliverables and payments."
                            action={
                                isActive && (
                                    <Button variant="outline" onClick={() => setShowAddMilestone(true)}>
                                        <Plus className="w-3.5 h-3.5 mr-1" /> Add First Milestone
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