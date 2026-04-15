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
    token: "primary" | "success" | "warning" | "destructive";
    wide?: boolean;
}

const FEATURES: FeatureItem[] = [
    {
        icon: <GitBranch className="w-5 h-5" />,
        title: "Milestone Contracts",
        description:
            "Break any project into paid milestones. Submit deliverables, get client approval, release funds automatically. No invoice chasing — ever. Both parties stay protected at every stage.",
        token: "primary",
        wide: true,
    },
    {
        icon: <FileText className="w-5 h-5" />,
        title: "Structured Bidding",
        description:
            "Every proposal includes price, timeline, and a cover letter. Clients compare apples to apples.",
        token: "success",
    },
    {
        icon: <BadgeCheck className="w-5 h-5" />,
        title: "Verified Profiles",
        description:
            "Skill badges, ratings, and work history from real completed contracts. Trust earned, not bought.",
        token: "warning",
    },
    {
        icon: <Scale className="w-5 h-5" />,
        title: "Dispute Resolution",
        description:
            "Fair mediation when contracts hit complications. Both parties get a voice. Documented outcomes — always.",
        token: "destructive",
        wide: true,
    },
    {
        icon: <LayoutDashboard className="w-5 h-5" />,
        title: "Contract Dashboard",
        description:
            "Track every active contract, milestone status, and payment history in one clean view.",
        token: "primary",
    },
    {
        icon: <Shield className="w-5 h-5" />,
        title: "Secure Payments",
        description:
            "Milestone funds are held safely until deliverables are approved. No surprises, ever.",
        token: "success",
    },
];

const tokenStyles: Record<string, string> = {
    primary:     "bg-primary/10 text-primary border-primary/20 group-hover:bg-primary/15 group-hover:border-primary/30",
    success:     "bg-success/10 text-success border-success/20 group-hover:bg-success/15 group-hover:border-success/30",
    warning:     "bg-warning/10 text-warning border-warning/20 group-hover:bg-warning/15 group-hover:border-warning/30",
    destructive: "bg-destructive/10 text-destructive border-destructive/20 group-hover:bg-destructive/15 group-hover:border-destructive/30",
};

const hoverAccent: Record<string, string> = {
    primary:     "group-hover:text-primary",
    success:     "group-hover:text-success",
    warning:     "group-hover:text-warning",
    destructive: "group-hover:text-destructive",
};

const bottomBar: Record<string, string> = {
    primary:     "bg-primary",
    success:     "bg-success",
    warning:     "bg-warning",
    destructive: "bg-destructive",
};

function FeatureCard({ feature, index }: { feature: FeatureItem; index: number }) {
    const iconClass  = tokenStyles[feature.token];
    const titleClass = hoverAccent[feature.token];
    const barClass   = bottomBar[feature.token];

    return (
        <div className={feature.wide ? "md:col-span-2 lg:col-span-4" : "md:col-span-1 lg:col-span-2"}>
            <Card
                className="group relative p-7 sm:p-9 h-full overflow-hidden flex flex-col"
            >
                {/* Index watermark */}
                <span
                    aria-hidden="true"
                    className="absolute top-5 right-6 font-mono text-[10px] font-bold tracking-widest text-muted-foreground/25 uppercase select-none"
                >
                    {String(index + 1).padStart(2, "0")}
                </span>

                {/* Icon */}
                <div
                    className={`inline-flex p-3 rounded-xl border mb-7 transition-all duration-[var(--duration-base)] self-start ${iconClass}`}
                >
                    {feature.icon}
                </div>

                {/* Text */}
                <h3 className={`font-display text-xl font-bold text-foreground mb-3 transition-colors duration-[var(--duration-base)] ${titleClass}`}>
                    {feature.title}
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed flex-1">
                    {feature.description}
                </p>

                {/* Bottom accent bar */}
                <div className={`mt-7 h-px w-0 ${barClass} rounded-full group-hover:w-14 transition-all duration-[var(--duration-slow)] ease-[var(--ease-decelerate)]`} />
            </Card>
        </div>
    );
}

export function FeaturesSection() {
    return (
        <section className="py-24 lg:py-32 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="max-w-xl mb-14 lg:mb-18">
                    <SectionLabel>Platform</SectionLabel>
                    <h2 className="font-display text-[clamp(2.25rem,4.5vw,3.75rem)] font-bold tracking-tight text-foreground mt-4 mb-4 leading-[1.05]">
                        Built for serious work.
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Every feature designed around one principle: protect your work, your
                        time, and your money — on both sides of the contract.
                    </p>
                </div>

                {/* Bento grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-5">
                    {FEATURES.map((feature, i) => (
                        <FeatureCard key={i} feature={feature} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}