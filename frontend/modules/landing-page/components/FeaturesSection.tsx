import { Card } from "@/modules/shared/components/card";
import { SectionLabel } from "@/modules/shared/components/section-label";
import {
    BadgeCheck,
    FileText,
    GitBranch,
    LayoutDashboard,
    Scale,
    Shield,
} from "lucide-react";

interface FeatureItem {
    icon: React.ReactNode;
    title: string;
    description: string;
    semanticToken: "primary" | "success" | "warning" | "destructive";
}

const FEATURES: FeatureItem[] = [
    {
        icon: <GitBranch className="w-5 h-5" />,
        title: "Milestone Contracts",
        description:
            "Break any project into paid milestones. Submit deliverables, get client approval, release funds. No invoice chasing — ever.",
        semanticToken: "primary",
    },
    {
        icon: <FileText className="w-5 h-5" />,
        title: "Structured Bidding",
        description:
            "Every proposal includes price, estimated timeline, and a cover letter. Clients compare apples to apples — not chaos to chaos.",
        semanticToken: "success",
    },
    {
        icon: <BadgeCheck className="w-5 h-5" />,
        title: "Verified Profiles",
        description:
            "Skill badges, ratings, and work history from real completed contracts. Trust is earned here, not assumed or bought.",
        semanticToken: "warning",
    },
    {
        icon: <Scale className="w-5 h-5" />,
        title: "Dispute Resolution",
        description:
            "Fair mediation when contracts hit complications. Both parties get a voice. Outcomes are equitable and documented.",
        semanticToken: "destructive",
    },
    {
        icon: <LayoutDashboard className="w-5 h-5" />,
        title: "Contract Dashboard",
        description:
            "Track every active contract, milestone status, and payment history from a single, clean dashboard view.",
        semanticToken: "primary",
    },
    {
        icon: <Shield className="w-5 h-5" />,
        title: "Secure Payments",
        description:
            "Milestone funds are held safely until deliverables are approved. Neither party can be blindsided.",
        semanticToken: "success",
    },
];

// Replaced raw hardcoded colors with semantic tokens from your status palette
const semanticMap = {
    primary:
        "bg-primary/10 text-primary border-primary/20 group-hover:bg-primary/15 accent-primary",
    success:
        "bg-success/10 text-success border-success/20 group-hover:bg-success/15 accent-success",
    warning:
        "bg-warning/10 text-warning border-warning/20 group-hover:bg-warning/15 accent-warning",
    destructive:
        "bg-destructive/10 text-destructive border-destructive/20 group-hover:bg-destructive/15 accent-destructive",
};

export function FeaturesSection() {
    return (
        <section className="py-24 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mb-16">
                    <SectionLabel>Platform</SectionLabel>
                    <h2 className="text-5xl font-bold tracking-tight text-foreground mt-4 mb-4">
                        Built for serious work.
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Every feature designed around one principle: protect
                        your work, your time, and your money — on both sides of
                        the contract.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {FEATURES.map((feature, i) => (
                        <FeatureCard key={i} feature={feature} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function FeatureCard({
    feature,
    index,
}: {
    feature: FeatureItem;
    index: number;
}) {
    const tokenClass = semanticMap[feature.semanticToken];

    return (
        <Card variant="interactive" className="group relative p-8 h-full">
            <div className="text-[10px] font-bold tracking-widest text-muted-foreground/50 mb-6 uppercase">
                {String(index + 1).padStart(2, "0")}
            </div>

            <div
                className={`inline-flex p-3 rounded-xl border mb-6 transition-all duration-base ${tokenClass}`}
            >
                {feature.icon}
            </div>

            <h3 className="text-xl font-bold text-foreground mb-3">
                {feature.title}
            </h3>
            <p className="text-base text-muted-foreground leading-relaxed">
                {feature.description}
            </p>
        </Card>
    );
}
