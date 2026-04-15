import { ArrowRight, Briefcase, DollarSign, Check, Zap } from "lucide-react";

const CLIENT_PERKS = [
    "Post projects in under 5 minutes",
    "Verified experts only",
    "Milestone-based payment protection",
    "Direct communication, zero middlemen",
];

const FREELANCER_PERKS = [
    "Browse 300+ open projects daily",
    "No bidding wars or undercutting",
    "Guaranteed milestone payments",
    "Build verified reputation fast",
];

export function RoleCardsSection() {
    return (
        <section className="py-24 lg:py-32 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-2 gap-5 sm:gap-6">

                    {/* ── Client card: dark/inverted ─────────────────────── */}
                    <div className="group relative overflow-hidden rounded-2xl bg-foreground text-background p-8 sm:p-10 lg:p-12 flex flex-col transition-all duration-[var(--duration-slow)] hover:-translate-y-1 hover:shadow-[var(--shadow-xl)]">
                        {/* Background orb */}
                        <div
                            aria-hidden="true"
                            className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-primary/20 blur-3xl opacity-60 group-hover:opacity-80 transition-opacity duration-[var(--duration-slow)]"
                        />
                        {/* Dot grid */}
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 opacity-[0.04]"
                            style={{
                                backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
                                backgroundSize: "28px 28px",
                            }}
                        />

                        <div className="relative z-10 flex flex-col flex-1">
                            <div className="inline-flex p-3 rounded-xl bg-background/10 border border-background/20 text-background mb-8 self-start">
                                <Briefcase className="w-5 h-5" />
                            </div>

                            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-background/50 mb-3">
                                For Clients
                            </div>
                            <h3 className="font-display text-[clamp(1.875rem,3.5vw,2.5rem)] font-bold text-background mb-4 leading-tight">
                                Hire world-class talent
                            </h3>
                            <p className="text-base text-background/65 leading-relaxed mb-8 max-w-sm">
                                Post your project and receive structured proposals within hours.
                                Manage milestones and payments in one secure place.
                            </p>

                            <ul className="space-y-3 mb-10">
                                {CLIENT_PERKS.map((perk) => (
                                    <li key={perk} className="flex items-center gap-3 text-sm text-background/80 font-medium">
                                        <span className="w-5 h-5 rounded-full bg-background/15 flex items-center justify-center shrink-0">
                                            <Check className="w-3 h-3 text-background" />
                                        </span>
                                        {perk}
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-auto">
                                <a
                                    href="#"
                                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-background text-foreground font-bold text-sm hover:bg-background/90 transition-all duration-[var(--duration-base)] hover:-translate-y-0.5 group/btn active:scale-[0.98]"
                                >
                                    Post a Project
                                    <ArrowRight className="w-4 h-4 transition-transform duration-[var(--duration-base)] group-hover/btn:translate-x-0.5" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* ── Freelancer card: light/surface ─────────────────── */}
                    <div className="group relative overflow-hidden rounded-2xl bg-card border border-border p-8 sm:p-10 lg:p-12 flex flex-col transition-all duration-[var(--duration-slow)] hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] hover:border-success/30">
                        {/* Background orb */}
                        <div
                            aria-hidden="true"
                            className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-success/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--duration-slow)]"
                        />

                        <div className="relative z-10 flex flex-col flex-1">
                            <div className="inline-flex p-3 rounded-xl bg-success/10 border border-success/20 text-success mb-8 self-start transition-all duration-[var(--duration-base)] group-hover:bg-success/15 group-hover:border-success/30">
                                <DollarSign className="w-5 h-5" />
                            </div>

                            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-success mb-3">
                                For Freelancers
                            </div>
                            <h3 className="font-display text-[clamp(1.875rem,3.5vw,2.5rem)] font-bold text-foreground mb-4 leading-tight">
                                Find high-value work
                            </h3>
                            <p className="text-base text-muted-foreground leading-relaxed mb-8 max-w-sm">
                                Browse open projects and submit proposals that stand out. Get paid
                                automatically as you hit your milestones.
                            </p>

                            <ul className="space-y-3 mb-10">
                                {FREELANCER_PERKS.map((perk) => (
                                    <li key={perk} className="flex items-center gap-3 text-sm text-foreground/80 font-medium">
                                        <span className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center shrink-0 group-hover:bg-success/15 transition-colors duration-[var(--duration-base)]">
                                            <Check className="w-3 h-3 text-success" />
                                        </span>
                                        {perk}
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-auto flex flex-wrap items-center gap-3">
                                <a
                                    href="#"
                                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-foreground text-background font-bold text-sm hover:bg-foreground/90 transition-all duration-[var(--duration-base)] hover:-translate-y-0.5 group/btn active:scale-[0.98]"
                                >
                                    Browse Projects
                                    <ArrowRight className="w-4 h-4 transition-transform duration-[var(--duration-base)] group-hover/btn:translate-x-0.5" />
                                </a>
                                <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                    <Zap className="w-3.5 h-3.5 text-warning" />
                                    Free to join
                                </span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}