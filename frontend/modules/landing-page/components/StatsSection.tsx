const STATS = [
    { value: "14,243", label: "Verified Freelancers" },
    { value: "$2.4M", label: "Paid to Talent" },
    { value: "98%", label: "Satisfaction Rate" },
    { value: "48h", label: "Avg First Bid" },
];

export function StatsSection() {
    return (
        <section className="border-y border-border bg-muted/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border border-x border-border">
                    {STATS.map((stat, i) => (
                        <div key={i} className="py-12 px-6 text-center group hover:bg-background transition-colors duration-base">
                            <div className="text-4xl font-extrabold text-foreground tracking-tight group-hover:text-primary transition-colors duration-base font-display">
                                {stat.value}
                            </div>
                            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-3">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}