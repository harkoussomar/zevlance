import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/components/card";
import { Avatar } from "@/modules/shared/components/avatar";
import type { DashboardContractItem } from "../types";

interface Props {
    contracts: DashboardContractItem[];
}

export function ClientActiveContracts({ contracts }: Props) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Active Contracts</CardTitle>
                    <Link href="/client/contracts" className="text-xs text-primary font-semibold hover:underline">
                        View all
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="pt-0 px-0 pb-0">
                {contracts.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8 px-5">
                        No active contracts yet.
                    </p>
                ) : (
                    contracts.map((contract) => {
                        const { total, approved } = contract.milestoneSummary;
                        return (
                            <Link
                                key={contract.id}
                                href={`/client/contracts/${contract.id}`}
                                className="flex items-center gap-3 px-5 py-3 border-b border-border last:border-b-0 hover:bg-muted/40 transition-colors"
                            >
                                <Avatar name={contract.freelancerName} size="sm" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-foreground truncate">
                                        {contract.freelancerName}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {contract.projectTitle}
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-xs font-bold text-foreground tabular-nums">
                                        {approved}/{total}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">milestones</p>
                                </div>
                            </Link>
                        );
                    })
                )}
            </CardContent>
        </Card>
    );
}