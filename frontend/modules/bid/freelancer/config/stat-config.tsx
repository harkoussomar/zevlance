import { CheckCircle2, Clock, MinusCircle, XCircle } from "lucide-react";
import { BidStatus } from "../../shared";

export const STAT_CONFIGS = [
    {
        status: "PENDING" as BidStatus,
        label: "Pending Review",
        icon: <Clock className="w-4 h-4" />,
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-500/10",
    },
    {
        status: "ACCEPTED" as BidStatus,
        label: "Accepted",
        icon: <CheckCircle2 className="w-4 h-4" />,
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-500/10",
    },
    {
        status: "REJECTED" as BidStatus,
        label: "Rejected",
        icon: <XCircle className="w-4 h-4" />,
        color: "text-destructive",
        bg: "bg-destructive/10",
    },
    {
        status: "WITHDRAWN" as BidStatus,
        label: "Withdrawn",
        icon: <MinusCircle className="w-4 h-4" />,
        color: "text-muted-foreground",
        bg: "bg-muted",
    },
];
