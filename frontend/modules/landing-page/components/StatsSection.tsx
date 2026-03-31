
interface StatItem {
    value: string;
    label: string;
    suffix?: string;
}

const STATS: StatItem[] = [
    { value: "14,243", label: "Verified Freelancers" },
    { value: "$2.4M", label: "Paid to Talent" },
    { value: "98%", label: "Satisfaction Rate" },
    { value: "48h", label: "Avg First Bid" },
];


export function StatsSection() {
    return (
        <section className="border-y border-border bg-muted/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
                    {STATS.map((stat, i) => (
                        <div
                            key={i}
                            className="py-10 px-6 text-center group hover:bg-muted/40 transition-colors duration-200"
                        >
                            <div className="text-4xl font-bold text-foreground tracking-tight group-hover:text-primary transition-colors duration-300">
                                {stat.value}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1.5 font-medium">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}