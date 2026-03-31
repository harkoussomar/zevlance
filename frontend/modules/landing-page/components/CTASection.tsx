import { ArrowRight, Briefcase, MessageSquare, Shield, Zap } from "lucide-react";

export function CTASection() {
    return (
        <section className="py-24 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-2xl bg-foreground text-background p-12 md:p-16">
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-5">
                        <div
                            className="absolute inset-0"
                            style={{
                                backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                                backgroundSize: "32px 32px",
                            }}
                        />
                    </div>
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-linear-to-br from-transparent via-transparent to-primary/20" />

                    <div className="relative grid lg:grid-cols-2 gap-10 items-center">
                        <div>
                            <div className="text-xs font-bold tracking-widest uppercase text-background/50 mb-4">
                                — Ready to start?
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-background mb-4 leading-tight">
                                The future of freelancing
                                <br />
                                is structured.
                            </h2>
                            <p className="text-background/70 text-lg leading-relaxed">
                                Join 14,000+ professionals who chose quality
                                over chaos. Real contracts, real milestones,
                                real results.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-3">
                                <a
                                    href="#"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-background text-foreground font-semibold text-sm hover:bg-background/90 transition-all hover:-translate-y-0.5 duration-200 shadow-lg"
                                >
                                    <Briefcase className="w-4 h-4" />
                                    Post a Project
                                </a>
                                <a
                                    href="#"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-background/30 text-background font-semibold text-sm hover:bg-background/10 transition-all hover:-translate-y-0.5 duration-200"
                                >
                                    Browse Work
                                    <ArrowRight className="w-4 h-4" />
                                </a>
                            </div>

                            {/* Trust signals */}
                            <div className="flex flex-wrap gap-4 pt-2">
                                {[
                                    {
                                        icon: <Zap className="w-3.5 h-3.5" />,
                                        text: "Free to browse",
                                    },
                                    {
                                        icon: (
                                            <Shield className="w-3.5 h-3.5" />
                                        ),
                                        text: "Milestone protection",
                                    },
                                    {
                                        icon: (
                                            <MessageSquare className="w-3.5 h-3.5" />
                                        ),
                                        text: "Direct messaging",
                                    },
                                ].map((item, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-1.5 text-xs text-background/60 font-medium"
                                    >
                                        {item.icon}
                                        {item.text}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}