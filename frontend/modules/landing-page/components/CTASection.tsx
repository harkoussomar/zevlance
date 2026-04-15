import { ArrowRight, Briefcase, MessageSquare, Shield, Zap } from "lucide-react";

const TRUST_SIGNALS = [
    { icon: Zap,           text: "Free to browse" },
    { icon: Shield,        text: "Milestone protection" },
    { icon: MessageSquare, text: "Direct messaging" },
];

export function CTASection() {
    return (
        <section className="py-24 lg:py-32 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl bg-foreground noise">

                    {/* Layered background effects */}
                    <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
                        {/* Primary glow — top left */}
                        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/30 blur-3xl opacity-50" />
                        {/* Gold glow — bottom right */}
                        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-gold/20 blur-3xl opacity-40" />
                        {/* Subtle grid */}
                        <div
                            className="absolute inset-0 opacity-[0.03]"
                            style={{
                                backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
                                backgroundSize: "36px 36px",
                            }}
                        />
                    </div>

                    <div className="relative z-10 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center p-8 sm:p-12 lg:p-16 xl:p-20">

                        {/* Left: Copy */}
                        <div>
                            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-background/40 mb-5 flex items-center gap-2">
                                <span className="w-6 h-px bg-background/30" />
                                Ready to start
                            </div>

                            <h2 className="font-display text-[clamp(2.25rem,4.5vw,3.75rem)] font-bold tracking-tight text-background leading-[1.05] mb-5">
                                The future of freelancing
                                <br />
                                <span className="text-gradient-gold">is structured.</span>
                            </h2>

                            <p className="text-background/65 text-lg leading-relaxed max-w-md">
                                Join 14,000+ professionals who chose quality over chaos. Real
                                contracts, real milestones, real results.
                            </p>
                        </div>

                        {/* Right: CTAs */}
                        <div className="space-y-6">
                            <div className="flex flex-wrap gap-3">
                                <a
                                    href="#"
                                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-background text-foreground font-bold text-sm hover:bg-background/90 transition-all duration-[var(--duration-base)] hover:-translate-y-0.5 shadow-[var(--shadow-md)] active:scale-[0.98]"
                                >
                                    <Briefcase className="w-4 h-4" />
                                    Post a Project
                                </a>
                                <a
                                    href="#"
                                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-background/25 text-background font-bold text-sm hover:bg-background/10 transition-all duration-[var(--duration-base)] hover:-translate-y-0.5 active:scale-[0.98]"
                                >
                                    Browse Work
                                    <ArrowRight className="w-4 h-4" />
                                </a>
                            </div>

                            <div className="flex flex-wrap gap-5 pt-1">
                                {TRUST_SIGNALS.map(({ icon: Icon, text }) => (
                                    <div key={text} className="flex items-center gap-2 text-xs text-background/55 font-medium">
                                        <Icon className="w-3.5 h-3.5 text-background/40 shrink-0" />
                                        {text}
                                    </div>
                                ))}
                            </div>

                            {/* Gold accent divider */}
                            <div className="pt-4 border-t border-background/10">
                                <p className="text-xs text-background/35 font-medium">
                                    No hidden fees · Cancel anytime · GDPR compliant
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}