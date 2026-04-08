import { CheckCircle2, Clock, MinusCircle, XCircle } from "lucide-react";

export const STATUS_CONFIG = {
    PENDING: {
        label: "Pending Review",
        icon: Clock,
        className:
            "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    ACCEPTED: {
        label: "Accepted",
        icon: CheckCircle2,
        className:
            "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    REJECTED: {
        label: "Rejected",
        icon: XCircle,
        className: "text-destructive bg-destructive/10 border-destructive/20",
    },
    WITHDRAWN: {
        label: "Withdrawn",
        icon: MinusCircle,
        className: "text-muted-foreground bg-muted border-border",
    },
} as const;
