import { CheckCircle2, Clock, MinusCircle, XCircle } from "lucide-react";
import { BidStatus } from "../types";

export const TABS_CONFIG: Array<{
    value: BidStatus | "ALL";
    label: string;
    icon: React.ReactNode;
}> = [
    { value: "ALL", label: "All", icon: null },
    {
        value: "PENDING",
        label: "Pending",
        icon: <Clock className="w-3.5 h-3.5" />,
    },
    {
        value: "ACCEPTED",
        label: "Accepted",
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    {
        value: "REJECTED",
        label: "Rejected",
        icon: <XCircle className="w-3.5 h-3.5" />,
    },
    {
        value: "WITHDRAWN",
        label: "Withdrawn",
        icon: <MinusCircle className="w-3.5 h-3.5" />,
    },
];