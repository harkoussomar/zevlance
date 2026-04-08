// ─── features/milestone/utils/milestone-status.config.tsx ────────────────────
//
// Pure data + presentational logic extracted from ClientMilestoneCard and
// FreelancerMilestoneCard so that:
//   1. Both components share the same type-safe style map
//   2. The maps and icon components are independently unit-testable
//   3. Adding a new MilestoneStatus causes a compile error here (exhaustive),
//      not a silent runtime miss in two separate card files
//
// The only difference between the two roles is the FUNDED visual treatment:
//   • Client sees indigo  → "you are paying into escrow"
//   • Freelancer sees emerald → "you have been paid into escrow, start working"

import {
  CheckCircle2,
  Clock,
  RotateCcw,
  Upload,
  BadgeCheck,
  ShieldAlert,
  Undo2,
  AlertCircle,
} from "lucide-react";

import type { MilestoneStatus } from "../types";

// ─── Style maps ───────────────────────────────────────────────────────────────

type StatusStyle = { card: string; dot: string };

const BASE_STYLES: Record<MilestoneStatus, StatusStyle> = {
  PENDING: {
    card: "border-border bg-card",
    dot:  "border-border bg-muted",
  },
  SUBMITTED: {
    card: "border-blue-500/25 bg-blue-500/[0.02] dark:bg-blue-500/[0.04]",
    dot:  "border-blue-500 bg-blue-500/10",
  },
  APPROVED: {
    card: "border-emerald-500/25 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.04]",
    dot:  "border-emerald-500 bg-emerald-500",
  },
  REVISION_REQUESTED: {
    card: "border-amber-500/25 bg-amber-500/[0.02] dark:bg-amber-500/[0.04]",
    dot:  "border-amber-500 bg-amber-500/10",
  },
  DISPUTED: {
    card: "border-destructive/25 bg-destructive/[0.02] dark:bg-destructive/[0.04]",
    dot:  "border-destructive bg-destructive/10",
  },
  REFUNDED: {
    card: "border-border bg-muted/30",
    dot:  "border-border bg-muted",
  },
  // Overridden per-role below
  FUNDED: {
    card: "",
    dot:  "",
  },
};

/** Indigo — "you (the client) are putting money into escrow" */
export const clientStatusStyles: Record<MilestoneStatus, StatusStyle> = {
  ...BASE_STYLES,
  FUNDED: {
    card: "border-indigo-500/25 bg-indigo-500/[0.02] dark:bg-indigo-500/[0.04]",
    dot:  "border-indigo-500 bg-indigo-500/10",
  },
};

/** Emerald — "escrow is funded, you can start working" */
export const freelancerStatusStyles: Record<MilestoneStatus, StatusStyle> = {
  ...BASE_STYLES,
  FUNDED: {
    card: "border-emerald-500/25 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.04]",
    dot:  "border-emerald-500 bg-emerald-500/10",
  },
};

// ─── Status icons ─────────────────────────────────────────────────────────────

/** Top-right icon on the client milestone card */
export function ClientStatusIcon({ status }: { status: MilestoneStatus }) {
  switch (status) {
    case "APPROVED":
      return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    case "FUNDED":
      return <BadgeCheck className="w-4 h-4 text-indigo-500" />;
    case "SUBMITTED":
      return <AlertCircle className="w-4 h-4 text-blue-500 animate-pulse" />;
    case "REVISION_REQUESTED":
      return <RotateCcw className="w-4 h-4 text-amber-500" />;
    case "DISPUTED":
      return <ShieldAlert className="w-4 h-4 text-destructive" />;
    case "REFUNDED":
      return <Undo2 className="w-4 h-4 text-muted-foreground" />;
    default:
      return <Clock className="w-4 h-4 text-muted-foreground" />;
  }
}

/** Top-right icon on the freelancer milestone card */
export function FreelancerStatusIcon({ status }: { status: MilestoneStatus }) {
  switch (status) {
    case "APPROVED":
      return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    case "FUNDED":
      // Emerald for freelancer — escrow is ready for them
      return <BadgeCheck className="w-4 h-4 text-emerald-500" />;
    case "SUBMITTED":
      return <Upload className="w-4 h-4 text-blue-500" />;
    case "REVISION_REQUESTED":
      // Slow spin signals "needs attention" without being alarming
      return <RotateCcw className="w-4 h-4 text-amber-500 animate-spin animation-duration-[3s]" />;
    case "DISPUTED":
      return <ShieldAlert className="w-4 h-4 text-destructive" />;
    case "REFUNDED":
      return <Undo2 className="w-4 h-4 text-muted-foreground" />;
    default:
      return <Clock className="w-4 h-4 text-muted-foreground" />;
  }
}