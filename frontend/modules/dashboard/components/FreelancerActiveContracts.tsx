import Link from "next/link";
import { ContractStatusBadge, MilestoneStatusBadge } from "@/modules/shared/components/status-badge";
import { Card, CardContent } from "@/modules/shared/components/card";
import { Progress } from "@/modules/shared/components/progress";
import { EmptyState } from "@/modules/shared/components/empty-state";
import { Briefcase } from "lucide-react";
import type { DashboardContractItem } from "../types";
import { formatCurrency, formatDate } from "@/modules/shared";

interface Props {
    contracts: DashboardContractItem[];
}

export function FreelancerActiveContracts({ contracts }: Props) {
    if (contracts.length === 0) {
        return (
            <EmptyState
                icon={<Briefcase className="w-7 h-7" />}
                title="No active contracts yet"
                description="Browse projects to find work."
            />
        );
    }

    return (
        <div className="space-y-4">
            {contracts.map((contract) => {
                const { total, approved, nextMilestone } = contract.milestoneSummary;
                const pct = total > 0 ? (approved / total) * 100 : 0;

                return (
                    <Card
                        key={contract.id}
                        className="hover:border-primary/30 hover:shadow-md transition-all duration-200"
                    >
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="min-w-0">
                                    <Link
                                        href={`/freelancer/contracts/${contract.id}`}
                                        className="font-bold text-foreground hover:text-primary transition-colors line-clamp-1 block"
                                    >
                                        {contract.projectTitle}
                                    </Link>
                                    <p className="text-sm text-muted-foreground mt-0.5">
                                        Client:{" "}
                                        <span className="text-foreground font-medium">
                                            {contract.clientName}
                                        </span>
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="font-bold text-foreground tabular-nums">
                                        {formatCurrency(contract.agreedPrice)}
                                    </div>
                                    <ContractStatusBadge status={contract.status} className="mt-1" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Milestones progress</span>
                                    <span className="font-semibold text-foreground">
                                        {approved}/{total} approved
                                    </span>
                                </div>
                                <Progress value={pct} showLabel />
                            </div>

                            {nextMilestone && (
                                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-foreground truncate">
                                            {nextMilestone.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Due {formatDate(nextMilestone.dueDate)}
                                        </p>
                                    </div>
                                    <MilestoneStatusBadge status={nextMilestone.status} />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}