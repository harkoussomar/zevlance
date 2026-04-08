import { cn } from "@/modules/shared";
import { Card, CardContent } from "./card";

interface StatCardProps {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: { value: string; positive: boolean };
    className?: string;
}

export function StatCard({
    label,
    value,
    icon,
    trend,
    className,
}: StatCardProps) {
    return (
        <Card
            className={cn(
                "group hover:border-primary/30 hover:shadow-md transition-all duration-200",
                className,
            )}
        >
            <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <span className="text-sm font-medium text-muted-foreground">
                        {label}
                    </span>
                    {icon && (
                        <div className="p-2 rounded-lg bg-primary/8 text-primary group-hover:bg-primary/12 transition-colors">
                            {icon}
                        </div>
                    )}
                </div>
                <div className="text-2xl font-bold text-foreground tracking-tight">
                    {value}
                </div>
                {trend && (
                    <p
                        className={cn(
                            "text-xs font-medium mt-1.5",
                            trend.positive
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-destructive",
                        )}
                    >
                        {trend.positive ? "↑" : "↓"} {trend.value}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
