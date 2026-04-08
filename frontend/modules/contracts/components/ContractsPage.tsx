"use client";

import { useMemo } from "react";
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
import { cn } from "@/modules/shared";

import { ContractStatusBadge } from "@/modules/shared/components/status-badge";
import type { ContractResponse, ContractStatus } from "@/modules/contracts/types";
import { useMyContracts } from "@/modules/contracts/hooks/useContract";
import { Card, CardContent } from "@/modules/shared/components/card";
import { Progress } from "@/modules/shared/components/progress";
import { Avatar } from "@/modules/shared/components/avatar";
import { Skeleton, SkeletonCard } from "@/modules/shared/components/skeleton";
import { StatCard } from "@/modules/shared/components/stat-card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/modules/shared/components/tabs";
import { EmptyState } from "@/modules/shared/components/empty-state";
import { selectRole, useAuthStore } from "@/store/auth-store";
import { useContractMilestones } from "@/modules/milestone/hooks/useMilestone";
import {
  formatCurrency,
  formatDate,
  percentage,
  ROLE_REDIRECT,
} from "@/modules/shared";

// ─── Contract Card ────────────────────────────────────────────────────────────

function ContractCard({ contract }: { contract: ContractResponse }) {
  const { data: milestones = [] } = useContractMilestones(contract.id);
  const role = useAuthStore(selectRole);

  // Pre-compute derived values once — avoids repeated .filter() calls in JSX
  const approvedCount = useMemo(
    () => milestones.filter((m) => m.status === "APPROVED").length,
    [milestones],
  );
  const totalPaid = useMemo(
    () =>
      milestones
        .filter((m) => m.status === "APPROVED")
        .reduce((s, m) => s + m.amount, 0),
    [milestones],
  );
  const nextMilestone = useMemo(
    () => milestones.find((m) => m.status === "PENDING" || m.status === "SUBMITTED"),
    [milestones],
  );

  const totalCount = milestones.length;
  const pct = percentage(approvedCount, totalCount);

  return (
    <Link href={`${ROLE_REDIRECT[role!]}/contracts/${contract.id}`}>
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
                <span className="text-muted-foreground/50">·</span>
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

          {/* Financial summary */}
          <div className="grid grid-cols-2 gap-4 py-3 border-y border-border mb-4">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Agreed Price</p>
              <p className="font-bold text-foreground">
                {formatCurrency(contract.agreedPrice)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Paid Out</p>
              <p className="font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totalPaid)}
              </p>
            </div>
          </div>

          {/* Milestones progress */}
          {totalCount > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Milestones</span>
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
                    {nextMilestone.status === "SUBMITTED" ? "Awaiting Review" : "Pending"}
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

// ─── Tab values ───────────────────────────────────────────────────────────────

const TABS = ["ALL", "ACTIVE", "COMPLETED", "DISPUTED", "CANCELLED"] as const;
type TabValue = (typeof TABS)[number];

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ContractsPage() {
  const { data: contracts = [], isPending, isError } = useMyContracts();

  // Pre-group once per render instead of calling .filter() inline on every tab
  // and every stat — avoids repeated passes over the same array in JSX.
  const grouped = useMemo(() => {
    const result: Record<ContractStatus | "ALL", ContractResponse[]> = {
      ALL: contracts,
      ACTIVE: [],
      COMPLETED: [],
      DISPUTED: [],
      CANCELLED: [],
    };
    for (const c of contracts) {
      result[c.status].push(c);
    }
    return result;
  }, [contracts]);

  const activeValue = useMemo(
    () => grouped.ACTIVE.reduce((s, c) => s + c.agreedPrice, 0),
    [grouped.ACTIVE],
  );
  const totalEarned = useMemo(
    () => grouped.COMPLETED.reduce((s, c) => s + c.agreedPrice, 0),
    [grouped.COMPLETED],
  );

  // Consistent error state — uses EmptyState instead of a plain <p> to match
  // the rest of the codebase's error display convention.
  if (isError) {
    return (
      <EmptyState
        icon={<FileText className="w-5 h-5" />}
        title="Could not load contracts"
        description="Something went wrong. Please refresh the page to try again."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Contracts</h1>
        {isPending ? (
          <Skeleton className="h-4 w-48 mt-1" />
        ) : (
          <p className="text-muted-foreground mt-1">
            {contracts.length} total contracts · {grouped.ACTIVE.length} active
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active"
          value={isPending ? "—" : grouped.ACTIVE.length}
          icon={<Clock className="w-4 h-4" />}
        />
        <StatCard
          label="Active Value"
          value={isPending ? "—" : formatCurrency(activeValue)}
          icon={<DollarSign className="w-4 h-4" />}
        />
        <StatCard
          label="Completed"
          value={isPending ? "—" : grouped.COMPLETED.length}
          icon={<CheckCircle2 className="w-4 h-4" />}
        />
        <StatCard
          label="Total Earned"
          value={isPending ? "—" : formatCurrency(totalEarned)}
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
          <TabsTrigger value="ACTIVE" badge={grouped.ACTIVE.length}>
            Active
          </TabsTrigger>
          <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
          <TabsTrigger value="DISPUTED">Disputed</TabsTrigger>
          <TabsTrigger value="CANCELLED">Cancelled</TabsTrigger>
        </TabsList>

        {TABS.map((tab) => {
          const tabContracts = grouped[tab as TabValue];
          return (
            <TabsContent key={tab} value={tab}>
              {isPending ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : tabContracts.length === 0 ? (
                <EmptyState
                  icon={<FileText className="w-5 h-5" />}
                  title="No contracts"
                  description={`You have no ${tab === "ALL" ? "" : tab.toLowerCase() + " "}contracts yet.`}
                />
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {tabContracts.map((contract) => (
                    <ContractCard key={contract.id} contract={contract} />
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}