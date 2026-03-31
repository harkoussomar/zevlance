"use client";

import Link from "next/link";
import {
    FileText,
    ArrowRight,
    Calendar,
    DollarSign,
    CheckCircle2,
    Clock,
    Users,
} from "lucide-react";
import { MOCK_CONTRACTS, MOCK_MILESTONES } from "@/lib/mock-data";
import { formatCurrency, formatDate, cn, percentage } from "@/lib/utils";
import {
    Card,
    CardContent,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
    EmptyState,
    StatCard,
    Avatar,
    Progress,
} from "@/components/ui";
import { ContractStatusBadge } from "@/components/shared/status-badge";
import type { ContractStatus, ContractResponse } from "@/types";

// ─── Contract Card ────────────────────────────────────────────────────────────

function ContractCard({ contract }: { contract: ContractResponse }) {
    const milestones = MOCK_MILESTONES.filter(
        (m) => m.contractId === contract.id,
    );
    const approvedCount = milestones.filter(
        (m) => m.status === "APPROVED",
    ).length;
    const totalCount = milestones.length;
    const pct = percentage(approvedCount, totalCount);

    const totalPaid = milestones
        .filter((m) => m.status === "APPROVED")
        .reduce((s, m) => s + m.amount, 0);

    const nextMilestone = milestones.find(
        (m) => m.status === "PENDING" || m.status === "SUBMITTED",
    );

    return (
        <Link href={`/contracts/${contract.id}`}>
            <Card className="group hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                <CardContent className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="min-w-0">
                            <p className="font-bold text-foreground group-hover:text-primary transition-colors text-sm leading-snug line-clamp-2">
                                {contract.projectTitle}
                            </p>
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {contract.freelancerName}
                                </span>
                                <span className="text-muted-foreground/50">
                                    ·
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Started {formatDate(contract.startDate)}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <ContractStatusBadge status={contract.status} />
                            <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                        </div>
                    </div>

                    {/* Financials */}
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
                                Paid Out
                            </p>
                            <p className="font-bold text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(totalPaid)}
                            </p>
                        </div>
                    </div>

                    {/* Milestones progress */}
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
                            <Progress value={pct} showLabel />
                            {nextMilestone && contract.status === "ACTIVE" && (
                                <div className="flex items-center justify-between pt-1">
                                    <p className="text-xs text-muted-foreground">
                                        Next:{" "}
                                        <span className="font-medium text-foreground">
                                            {nextMilestone.title}
                                        </span>
                                    </p>
                                    <span
                                        className={cn(
                                            "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                                            nextMilestone.status === "SUBMITTED"
                                                ? "bg-blue-500/10 text-blue-600"
                                                : "bg-muted text-muted-foreground",
                                        )}
                                    >
                                        {nextMilestone.status === "SUBMITTED"
                                            ? "Awaiting Review"
                                            : "Pending"}
                                    </span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground italic">
                            No milestones defined yet.
                        </p>
                    )}

                    {/* Parties */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                        <div className="flex items-center gap-2">
                            <Avatar name={contract.freelancerName} size="xs" />
                            <span className="text-xs text-muted-foreground">
                                {contract.freelancerName}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                                {contract.clientName}
                            </span>
                            <Avatar name={contract.clientName} size="xs" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContractsPage() {
    const contracts = MOCK_CONTRACTS;
    const activeContracts = contracts.filter((c) => c.status === "ACTIVE");
    const completedContracts = contracts.filter(
        (c) => c.status === "COMPLETED",
    );
    const totalEarned = completedContracts.reduce(
        (s, c) => s + c.agreedPrice,
        0,
    );
    const activeValue = activeContracts.reduce((s, c) => s + c.agreedPrice, 0);

    const byStatus = (status: ContractStatus | "ALL") =>
        status === "ALL"
            ? contracts
            : contracts.filter((c) => c.status === status);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground">
                    Contracts
                </h1>
                <p className="text-muted-foreground mt-1">
                    {contracts.length} total contracts ·{" "}
                    {activeContracts.length} active
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Active"
                    value={activeContracts.length}
                    icon={<Clock className="w-4 h-4" />}
                />
                <StatCard
                    label="Active Value"
                    value={formatCurrency(activeValue)}
                    icon={<DollarSign className="w-4 h-4" />}
                />
                <StatCard
                    label="Completed"
                    value={completedContracts.length}
                    icon={<CheckCircle2 className="w-4 h-4" />}
                />
                <StatCard
                    label="Total Earned"
                    value={formatCurrency(totalEarned)}
                    icon={<DollarSign className="w-4 h-4" />}
                    trend={{ value: "Across all time", positive: true }}
                />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="ALL">
                <TabsList>
                    <TabsTrigger value="ALL" badge={contracts.length}>
                        All Contracts
                    </TabsTrigger>
                    <TabsTrigger
                        value="ACTIVE"
                        badge={byStatus("ACTIVE").length}
                    >
                        Active
                    </TabsTrigger>
                    <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
                    <TabsTrigger value="DISPUTED">Disputed</TabsTrigger>
                    <TabsTrigger value="CANCELLED">Cancelled</TabsTrigger>
                </TabsList>

                {(
                    [
                        "ALL",
                        "ACTIVE",
                        "COMPLETED",
                        "DISPUTED",
                        "CANCELLED",
                    ] as const
                ).map((tab) => (
                    <TabsContent key={tab} value={tab}>
                        {byStatus(tab).length === 0 ? (
                            <EmptyState
                                icon={<FileText className="w-5 h-5" />}
                                title="No contracts"
                                description={`You have no ${tab === "ALL" ? "" : tab.toLowerCase() + " "}contracts yet.`}
                            />
                        ) : (
                            <div className="grid md:grid-cols-2 gap-4">
                                {byStatus(tab).map((contract) => (
                                    <ContractCard
                                        key={contract.id}
                                        contract={contract}
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
