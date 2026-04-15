import { BidStatus } from "@/modules/bid/shared";
import { ContractStatus } from "@/modules/contracts/shared";
import { MilestoneStatus } from "@/modules/milestone/shared";
import { ProjectCategory, ProjectStatus } from "@/modules/project/shared";

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
        className: "bg-destructive/10 text-destructive border-destructive/20",
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
    FUNDED: {
        // ← ADD
        label: "Funded",
        className:
            "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    },
    REFUNDED: {
        label: "Refunded",
        className:
            "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
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
    DISPUTED: {
        // ← ADD
        label: "Disputed",
        className:
            "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
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
