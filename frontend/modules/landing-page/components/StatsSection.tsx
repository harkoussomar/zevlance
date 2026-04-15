const STATS = [
    { value: "14,243", label: "Verified Freelancers", suffix: "" },
    { value: "$2.4M", label: "Paid to Talent", suffix: "" },
    { value: "98%", label: "Satisfaction Rate", suffix: "" },
    { value: "48h", label: "Avg. First Bid", suffix: "" },
];

export function StatsSection() {
    return (
        <section className="border-y border-border bg-muted/20 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 lg:grid-cols-4">
                    {STATS.map((stat, i) => (
                        <div
                            key={i}
                            className="relative group py-10 sm:py-14 px-6 text-center transition-colors duration-[var(--duration-slow)] hover:bg-background"
                        >
                            {/* Vertical divider — right side except last */}
                            {i < STATS.length - 1 && (
                                <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 h-16 w-px bg-border" />
                            )}
                            {/* Mobile: right divider on odd cols */}
                            {i % 2 === 0 && (
                                <div className="lg:hidden absolute right-0 top-1/2 -translate-y-1/2 h-16 w-px bg-border" />
                            )}
                            {/* Mobile: bottom divider on first row */}
                            {i < 2 && (
                                <div className="lg:hidden absolute bottom-0 left-6 right-6 h-px bg-border" />
                            )}

                            <div className="font-display text-[clamp(2rem,4.5vw,3.25rem)] font-extrabold text-foreground tracking-tight leading-none group-hover:text-gradient-primary transition-all duration-[var(--duration-base)] tabular-nums">
                                {stat.value}
                            </div>
                            <div className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mt-3 leading-tight">
                                {stat.label}
                            </div>

                            {/* Subtle bottom accent on hover */}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-0 bg-primary rounded-full group-hover:w-12 transition-all duration-[var(--duration-slow)] ease-[var(--ease-decelerate)]" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}