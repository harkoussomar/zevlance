import { cn } from "@/modules/shared";

interface ProgressProps {
    value: number;
    max?: number;
    className?: string;
    barClassName?: string;
    showLabel?: boolean;
}

export function Progress({
    value,
    max = 100,
    className,
    barClassName,
    showLabel,
}: ProgressProps) {
    const pct = Math.min(Math.max((value / max) * 100, 0), 100);
    return (
        <div className={cn("flex items-center gap-3", className)}>
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                    className={cn(
                        "h-full rounded-full bg-primary transition-all duration-500",
                        barClassName,
                    )}
                    style={{ width: `${pct}%` }}
                />
            </div>
            {showLabel && (
                <span className="text-xs font-semibold text-muted-foreground w-9 text-right">
                    {Math.round(pct)}%
                </span>
            )}
        </div>
    );
}
