// ─── features/contracts/components/ContractSidebar.tsx ───────────────────────

"use client";

import {
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/modules/shared/components/card";
import { Avatar } from "@/modules/shared/components/avatar";
import { Separator } from "@/modules/shared/components/separator";
import { Badge } from "@/modules/shared/components/badge";
import type { MilestoneResponse } from "@/modules/milestone/types";
import type { ContractResponse } from "../types";
import { formatCurrency, formatDate } from "@/modules/shared";

// ─── Stat Row ─────────────────────────────────────────────────────────────────

function StatRow({
  label,
  value,
  valueClassName,
  icon: Icon,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
        {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
        <span className="truncate">{label}</span>
      </div>
      <span
        className={`text-sm font-semibold text-right shrink-0 ${valueClassName ?? "text-foreground"}`}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Timeline helpers ─────────────────────────────────────────────────────────

function daysElapsed(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

// ─── ContractSidebar ──────────────────────────────────────────────────────────

interface ContractSidebarProps {
  contract: ContractResponse;
  milestones: MilestoneResponse[];
  /** "client" perspective shows "Amount Released"; "freelancer" shows "Earnings" */
  perspective: "client" | "freelancer";
}

export function ContractSidebar({
  contract,
  milestones,
  perspective,
}: ContractSidebarProps) {
  
  // ─── Financial calculations ────────────────────────────────────────────────
  // Memoised — milestones array can be large and these reduce calls
  // run on every render without it.
  const { released, remaining, pendingReview, approvedCount } =
    useMemo(() => {
      const approved = milestones.filter((m) => m.status === "APPROVED");
      const rel = approved.reduce((s, m) => s + m.amount, 0);
      const total = milestones.reduce((s, m) => s + m.amount, 0);
      return {
        released: rel,
        totalMilestoneValue: total,
        remaining: Math.max(0, total - rel),
        pendingReview: milestones.filter((m) => m.status === "SUBMITTED").length,
        approvedCount: approved.length,
      };
    }, [milestones]);

  const elapsed = daysElapsed(contract.startDate);
  const isClient = perspective === "client";

  return (
    <div className="space-y-4">
      {/* ─── Financial Summary ──────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2 pt-5 px-5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            Financial Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <StatRow
            label="Agreed Price"
            value={formatCurrency(contract.agreedPrice)}
            icon={TrendingUp}
          />
          <Separator />
          <StatRow
            label={isClient ? "Amount Released" : "Earnings Received"}
            value={formatCurrency(released)}
            valueClassName="text-emerald-600 dark:text-emerald-400"
            icon={CheckCircle2}
          />
          <StatRow
            label="Remaining"
            value={formatCurrency(remaining)}
            icon={Clock}
          />
          {milestones.length > 0 && (
            <>
              <Separator />
              <StatRow
                label="Milestones"
                value={`${approvedCount} / ${milestones.length} approved`}
              />
              {pendingReview > 0 && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Awaiting review</span>
                  <Badge
                    variant="secondary"
                    className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                  >
                    {pendingReview} pending
                  </Badge>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* ─── Timeline ───────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2 pt-5 px-5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <StatRow label="Start Date" value={formatDate(contract.startDate)} />
          <Separator />
          <StatRow
            label="End Date"
            value={contract.endDate ? formatDate(contract.endDate) : "Ongoing"}
          />
          <StatRow
            label="Duration"
            value={`${elapsed} day${elapsed !== 1 ? "s" : ""} elapsed`}
          />
        </CardContent>
      </Card>

      {/* ─── Contract Parties ────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2 pt-5 px-5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            Parties
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-3">
          {/* Client */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar name={contract.clientName} size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {contract.clientName}
                </p>
                <p className="text-xs text-muted-foreground">Client</p>
              </div>
            </div>
            {isClient && (
              <Badge
                variant="outline"
                className="text-[10px] border-blue-500/30 text-blue-600 bg-blue-500/5 shrink-0"
              >
                You
              </Badge>
            )}
          </div>

          <Separator />

          {/* Freelancer */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar name={contract.freelancerName} size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {contract.freelancerName}
                </p>
                <p className="text-xs text-muted-foreground">Freelancer</p>
              </div>
            </div>
            {!isClient && (
              <Badge
                variant="outline"
                className="text-[10px] border-emerald-500/30 text-emerald-600 bg-emerald-500/5 shrink-0"
              >
                You
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ─── Project Link ────────────────────────────────────────────────────── */}
      <Link
        href={`/projects/${contract.projectId}`}
        className="flex items-center justify-between gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-1 py-2 rounded-lg hover:bg-muted/50 group"
      >
        <span className="truncate">View project listing</span>
        <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
      </Link>
    </div>
  );
}