import { cn } from "@/modules/shared";
import { Card, CardContent } from "./card";

interface StatCardProps {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: { value: string; positive: boolean };
    className?: string;
}

export function StatCard({ label, value, icon, trend, className }: StatCardProps) {
    return (
        <Card
            className={cn(
                "group relative overflow-hidden transition-all duration-300",
                "hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5",
                className,
            )}
        >
            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse 80% 60% at 80% 20%, oklch(from var(--primary) l c h / 0.05) 0%, transparent 70%)",
                }}
            />

            <CardContent className="p-5 relative">
                <div className="flex items-start justify-between mb-4">
                    <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/80">
                        {label}
                    </span>
                    {icon && (
                        <div className={cn(
                            "p-2 rounded-xl transition-all duration-300",
                            "bg-primary/8 text-primary",
                            "group-hover:bg-primary/14 group-hover:scale-110 group-hover:shadow-sm",
                        )}>
                            {icon}
                        </div>
                    )}
                </div>

                <div className="text-2xl font-bold text-foreground tracking-tight font-display tabular-nums">
                    {value}
                </div>

                {trend ? (
                    <p className={cn(
                        "text-xs font-semibold mt-2 flex items-center gap-1",
                        trend.positive ? "text-success" : "text-destructive",
                    )}>
                        <span className={cn(
                            "inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px]",
                            trend.positive ? "bg-success/12" : "bg-destructive/12",
                        )}>
                            {trend.positive ? "↑" : "↓"}
                        </span>
                        {trend.value}
                    </p>
                ) : (
                    <div className="mt-2 h-1.5 w-12 rounded-full bg-primary/15 group-hover:w-16 transition-all duration-500" />
                )}
            </CardContent>
        </Card>
    );
}