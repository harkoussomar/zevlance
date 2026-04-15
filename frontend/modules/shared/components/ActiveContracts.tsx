import Link from "next/link";
import {
    ContractStatusBadge,
    MilestoneStatusBadge,
} from "@/modules/shared/components/status-badge";
import { EmptyState } from "@/modules/shared/components/empty-state";
import { Briefcase } from "lucide-react";
import { formatCurrency, formatDate } from "@/modules/shared";
import { OverviewContractItem } from "@/modules/overview/freelancer/types/overview.freelancer";

interface Props {
    contracts: OverviewContractItem[];
    role: "client" | "freelancer";
}

function ProjectInitials({ title }: { title: string }) {
    const words = title.trim().split(/\s+/);
    const initials =
        words.length >= 2 ? words[0][0] + words[1][0] : title.slice(0, 2);

    const colors = [
        "bg-violet-100 text-violet-700",
        "bg-sky-100 text-sky-700",
        "bg-emerald-100 text-emerald-700",
        "bg-amber-100 text-amber-700",
        "bg-rose-100 text-rose-700",
        "bg-indigo-100 text-indigo-700",
        "bg-teal-100 text-teal-700",
    ];

    const hash = title.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const color = colors[hash % colors.length];

    return (
        <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${color}`}
        >
            {initials.toUpperCase()}
        </div>
    );
}

function MilestoneDots({
    total,
    approved,
}: {
    total: number;
    approved: number;
}) {
    const max = Math.min(total, 8);
    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: max }).map((_, i) => {
                const done = i < approved;
                return (
                    <span
                        key={i}
                        className={`block rounded-full transition-all ${
                            done
                                ? "w-2.5 h-2.5 bg-primary"
                                : "w-2 h-2 bg-muted-foreground/20"
                        }`}
                    />
                );
            })}
            {total > 8 && (
                <span className="text-[10px] text-muted-foreground font-medium ml-0.5">
                    +{total - 8}
                </span>
            )}
        </div>
    );
}

export function ActiveContracts({ contracts, role }: Props) {
    if (contracts.length === 0) {
        return (
            <EmptyState
                icon={<Briefcase className="w-7 h-7" />}
                title="No active contracts yet"
                description={
                    role === "freelancer"
                        ? "Browse projects to find work."
                        : "Post a project to get started."
                }
            />
        );
    }

    return (
        <div className="divide-y divide-border/50 rounded-2xl border border-border/60 overflow-hidden bg-background">
            {contracts.map((contract) => {
                const { total, approved, nextMilestone } =
                    contract.milestoneSummary;
                const pct =
                    total > 0 ? Math.round((approved / total) * 100) : 0;
                const counterpart =
                    role === "freelancer"
                        ? contract.clientName
                        : contract.freelancerName;
                const href =
                    role === "freelancer"
                        ? `/freelancer/contracts/${contract.id}`
                        : `/client/contracts/${contract.id}`;

                return (
                    <Link
                        key={contract.id}
                        href={href}
                        className="group flex items-start gap-3 px-4 py-4 sm:px-5 hover:bg-muted/40 transition-colors"
                    >
                        {/* Avatar */}
                        <ProjectInitials title={contract.projectTitle} />

                        {/* All content after avatar */}
                        <div className="flex-1 min-w-0 flex flex-col gap-2">
                            {/* Row 1: title + price (price moves here on mobile) */}
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate leading-tight">
                                        {contract.projectTitle}
                                    </p>
                                    {counterpart && (
                                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                            {role === "freelancer"
                                                ? "Client"
                                                : "Freelancer"}
                                            {" · "}
                                            <span className="text-foreground/70 font-medium">
                                                {counterpart}
                                            </span>
                                        </p>
                                    )}
                                </div>

                                {/* Price + status — always top-right */}
                                <div className="shrink-0 flex flex-col items-end gap-1">
                                    <span className="text-sm font-bold text-foreground tabular-nums">
                                        {formatCurrency(contract.agreedPrice)}
                                    </span>
                                    <ContractStatusBadge
                                        status={contract.status}
                                    />
                                </div>
                            </div>

                            {/* Row 2: progress dots + next milestone */}
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                                <div className="flex items-center gap-2.5">
                                    <MilestoneDots
                                        total={total}
                                        approved={approved}
                                    />
                                    <span className="text-[11px] text-muted-foreground tabular-nums">
                                        {approved}/{total}
                                        <span className="ml-1 font-medium text-foreground/60">
                                            ({pct}%)
                                        </span>
                                    </span>
                                </div>

                                {nextMilestone ? (
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[11px] text-muted-foreground">
                                            Due{" "}
                                            {formatDate(nextMilestone.dueDate)}
                                        </span>
                                        <MilestoneStatusBadge
                                            status={nextMilestone.status}
                                        />
                                    </div>
                                ) : (
                                    total > 0 &&
                                    approved === total && (
                                        <span className="text-[11px] font-semibold text-emerald-600">
                                            All done ✓
                                        </span>
                                    )
                                )}
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
