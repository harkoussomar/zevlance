import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type {
  ProjectStatus,
  BidStatus,
  ContractStatus,
  MilestoneStatus,
  ProjectCategory,
} from "@/types";

// ─── Class merger ─────────────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Currency ─────────────────────────────────────────────────────────────────

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatBudget(min: number, max: number): string {
  return `${formatCurrency(min)} – ${formatCurrency(max)}`;
}

// ─── Dates ────────────────────────────────────────────────────────────────────

export function formatDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export function formatRelative(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateStr);
  } catch {
    return dateStr;
  }
}

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

// ─── Status color maps ────────────────────────────────────────────────────────

export const PROJECT_STATUS_STYLES: Record<
  ProjectStatus,
  { label: string; className: string }
> = {
  OPEN: {
    label: "Open",
    className:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-muted text-muted-foreground border-border",
  },
  CANCELLED: {
    label: "Cancelled",
    className:
      "bg-destructive/10 text-destructive border-destructive/20",
  },
};

export const BID_STATUS_STYLES: Record<
  BidStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: "Pending",
    className:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  ACCEPTED: {
    label: "Accepted",
    className:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  WITHDRAWN: {
    label: "Withdrawn",
    className: "bg-muted text-muted-foreground border-border",
  },
};

export const CONTRACT_STATUS_STYLES: Record<
  ContractStatus,
  { label: string; className: string }
> = {
  ACTIVE: {
    label: "Active",
    className:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  COMPLETED: {
    label: "Completed",
    className:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  DISPUTED: {
    label: "Disputed",
    className:
      "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

export const MILESTONE_STATUS_STYLES: Record<
  MilestoneStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: "Pending",
    className: "bg-muted text-muted-foreground border-border",
  },
  SUBMITTED: {
    label: "Submitted",
    className:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  APPROVED: {
    label: "Approved",
    className:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  REVISION_REQUESTED: {
    label: "Revision Needed",
    className:
      "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  },
};

export const CATEGORY_STYLES: Record<
  ProjectCategory,
  { label: string; className: string }
> = {
  WEB_DEV: {
    label: "Web Dev",
    className:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  MOBILE: {
    label: "Mobile",
    className:
      "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
  DESIGN: {
    label: "Design",
    className:
      "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
  },
  DATA_SCIENCE: {
    label: "Data Science",
    className:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  DEVOPS: {
    label: "DevOps",
    className:
      "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  },
  WRITING: {
    label: "Writing",
    className:
      "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  },
  MARKETING: {
    label: "Marketing",
    className:
      "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
  OTHER: {
    label: "Other",
    className: "bg-muted text-muted-foreground border-border",
  },
};

// ─── Initials ─────────────────────────────────────────────────────────────────

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ─── Truncate ─────────────────────────────────────────────────────────────────

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "…";
}

// ─── Percentage ───────────────────────────────────────────────────────────────

export function percentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

// ─── Category options for selects ─────────────────────────────────────────────

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_STYLES).map(
  ([value, { label }]) => ({ value, label })
);

export const STATUS_OPTIONS = Object.entries(PROJECT_STATUS_STYLES).map(
  ([value, { label }]) => ({ value, label })
);