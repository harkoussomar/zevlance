import Link from "next/link";
import {
    ContractStatusBadge,
    MilestoneStatusBadge,
} from "@/modules/shared/components/status-badge";
import { Card, CardContent } from "@/modules/shared/components/card";
import { Progress } from "@/modules/shared/components/progress";
import { ContractResponse } from "@/modules/contracts/types";
import { useActiveContractsMilestones } from "@/modules/milestone/hooks/useMilestone";
import { formatCurrency, formatDate } from "@/modules/shared";

interface Props {
    contracts: ContractResponse[];
}

export function ActiveContractsList({ contracts }: Props) {
    // Fetch all milestone sets in parallel — one query per active contract
    const milestoneQueries = useActiveContractsMilestones(
        contracts.map((c) => c.id),
    );

    return (
        <div className="space-y-4">
            {contracts.map((contract, i) => {
                const milestones = milestoneQueries[i]?.data ?? [];
                const approved = milestones.filter(
                    (m) => m.status === "APPROVED",
                ).length;
                const total = milestones.length;
                const pct = total > 0 ? (approved / total) * 100 : 0;
                const nextMilestone = milestones.find(
                    (m) => m.status === "PENDING" || m.status === "SUBMITTED",
                );

                return (
                    <Card
                        key={contract.id}
                        className="hover:border-primary/30 hover:shadow-md transition-all duration-200"
                    >
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div>
                                    <Link
                                        href={`/freelancer/contracts/${contract.id}`}
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
                                        {formatCurrency(contract.agreedPrice)}
                                    </div>
                                    <ContractStatusBadge
                                        status={contract.status}
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            {/* Milestones progress */}
                            {milestoneQueries[i]?.isLoading ? (
                                <div className="h-5 bg-muted animate-pulse rounded-full" />
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>Milestones progress</span>
                                        <span className="font-semibold">
                                            {approved}/{total} approved
                                        </span>
                                    </div>
                                    <Progress value={pct} showLabel />
                                </div>
                            )}

                            {/* Next milestone */}
                            {nextMilestone && (
                                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold text-foreground">
                                            {nextMilestone.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Due{" "}
                                            {formatDate(nextMilestone.dueDate)}
                                        </p>
                                    </div>
                                    <MilestoneStatusBadge
                                        status={nextMilestone.status}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}

            {contracts.length === 0 && (
                <div className="text-center py-10 text-muted-foreground text-sm">
                    No active contracts yet.{" "}
                    <Link
                        href="/projects"
                        className="text-primary font-semibold hover:underline"
                    >
                        Browse projects
                    </Link>{" "}
                    to find work.
                </div>
            )}
        </div>
    );
}
