import type { Role } from "@/modules/shared/types";
import { Building2, User } from "lucide-react";

export const ROLE_OPTIONS: Array<{
    role: Role;
    label: string;
    description: string;
    icon: React.ReactNode;
    perks: string[];
}> = [
    {
        role: "FREELANCER",
        label: "Freelancer",
        description: "Browse projects, submit bids, get paid for great work.",
        icon: <User className="w-6 h-6" />,
        perks: [
            "Browse hundreds of open projects",
            "Submit structured proposals",
            "Milestone payment protection",
            "Build your verified rating",
        ],
    },
    {
        role: "CLIENT",
        label: "Client",
        description: "Post projects, hire talent, manage contracts.",
        icon: <Building2 className="w-6 h-6" />,
        perks: [
            "Post projects for free",
            "Receive structured bids",
            "Milestone-based contracts",
            "Rate your freelancers",
        ],
    },
];