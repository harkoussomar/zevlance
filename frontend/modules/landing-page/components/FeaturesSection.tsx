import { BadgeCheck, FileText, GitBranch, LayoutDashboard, Scale, Shield } from "lucide-react";


interface FeatureItem {
    icon: React.ReactNode;
    title: string;
    description: string;
    accent?: "primary" | "green" | "amber" | "rose";
}



const FEATURES: FeatureItem[] = [
    {
        icon: <GitBranch className="w-5 h-5" />,
        title: "Milestone Contracts",
        description:
            "Break any project into paid milestones. Submit deliverables, get client approval, release funds. No invoice chasing — ever.",
        accent: "primary",
    },
    {
        icon: <FileText className="w-5 h-5" />,
        title: "Structured Bidding",
        description:
            "Every proposal includes price, estimated timeline, and a cover letter. Clients compare apples to apples — not chaos to chaos.",
        accent: "green",
    },
    {
        icon: <BadgeCheck className="w-5 h-5" />,
        title: "Verified Profiles",
        description:
            "Skill badges, ratings, and work history from real completed contracts. Trust is earned here, not assumed or bought.",
        accent: "amber",
    },
    {
        icon: <Scale className="w-5 h-5" />,
        title: "Dispute Resolution",
        description:
            "Fair mediation when contracts hit complications. Both parties get a voice. Outcomes are equitable and documented.",
        accent: "rose",
    },
    {
        icon: <LayoutDashboard className="w-5 h-5" />,
        title: "Contract Dashboard",
        description:
            "Track every active contract, milestone status, and payment history from a single, clean dashboard view.",
        accent: "primary",
    },
    {
        icon: <Shield className="w-5 h-5" />,
        title: "Secure Payments",
        description:
            "Milestone funds are held safely until deliverables are approved. Neither party can be blindsided.",
        accent: "green",
    },
];

const accentMap = {
    primary:
        "bg-primary/10 text-primary border-primary/20 group-hover:bg-primary/15",
    green: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 group-hover:bg-emerald-500/15",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 group-hover:bg-amber-500/15",
    rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 group-hover:bg-rose-500/15",
};


function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-primary" />
            <span className="text-xs font-bold tracking-widest uppercase text-primary">
                {children}
            </span>
        </div>
    );
}


export function FeaturesSection() {
    return (
        <section className="py-24 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="max-w-2xl mb-16">
                    <SectionLabel>Platform</SectionLabel>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
                        Built for serious work.
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Every feature designed around one principle: protect
                        your work, your time, and your money — on both sides of
                        the contract.
                    </p>
                </div>

                {/* Feature grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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
    const accent = feature.accent ?? "primary";
    const iconClass = accentMap[accent];

    return (
        <div className="group relative p-6 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            {/* Top accent bar */}
            <div
                className={`absolute top-0 left-6 right-6 h-px rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 ${accent === "primary" ? "bg-primary" : accent === "green" ? "bg-emerald-500" : accent === "amber" ? "bg-amber-500" : "bg-rose-500"}`}
            />

            {/* Number */}
            <div className="text-[10px] font-bold tracking-widest text-muted-foreground/50 mb-4">
                {String(index + 1).padStart(2, "0")}
            </div>

            {/* Icon */}
            <div
                className={`inline-flex p-2.5 rounded-lg border mb-4 transition-all duration-300 ${iconClass}`}
            >
                {feature.icon}
            </div>

            <h3 className="text-base font-bold text-foreground mb-2">
                {feature.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
            </p>
        </div>
    );
}