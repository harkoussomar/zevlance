import {
  CheckCircle2,
  Clock,
  RotateCcw,
  BadgeCheck,
  ShieldAlert,
  Undo2,
  AlertCircle,
} from "lucide-react";
import type { MilestoneStatus } from "../../shared";

type StatusStyle = { card: string; dot: string };

export const clientStatusStyles: Record<MilestoneStatus, StatusStyle> = {
  PENDING: {
    card: "border-border bg-card",
    dot:  "border-border bg-muted",
  },
  FUNDED: {
    card: "border-primary/25 bg-primary/[0.02] dark:bg-primary/[0.04]",
    dot:  "border-primary bg-primary/10",
  },
  SUBMITTED: {
    card: "border-info/25 bg-info/[0.02] dark:bg-info/[0.04]",
    dot:  "border-info bg-info/10",
  },
  APPROVED: {
    card: "border-success/25 bg-success/[0.02] dark:bg-success/[0.04]",
    dot:  "border-success bg-success",
  },
  REVISION_REQUESTED: {
    card: "border-warning/25 bg-warning/[0.02] dark:bg-warning/[0.04]",
    dot:  "border-warning bg-warning/10",
  },
  DISPUTED: {
    card: "border-destructive/25 bg-destructive/[0.02] dark:bg-destructive/[0.04]",
    dot:  "border-destructive bg-destructive/10",
  },
  REFUNDED: {
    card: "border-border bg-muted/30",
    dot:  "border-border bg-muted",
  },
};

export function ClientStatusIcon({ status }: { status: MilestoneStatus }) {
  switch (status) {
    case "APPROVED":
      return <CheckCircle2 className="w-4 h-4 text-success" />;
    case "FUNDED":
      return <BadgeCheck className="w-4 h-4 text-primary" />;
    case "SUBMITTED":
      return <AlertCircle className="w-4 h-4 text-info animate-pulse" />;
    case "REVISION_REQUESTED":
      return <RotateCcw className="w-4 h-4 text-warning" />;
    case "DISPUTED":
      return <ShieldAlert className="w-4 h-4 text-destructive" />;
    case "REFUNDED":
      return <Undo2 className="w-4 h-4 text-muted-foreground" />;
    default:
      return <Clock className="w-4 h-4 text-muted-foreground" />;
  }
}