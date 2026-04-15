
import { Card, CardContent } from "@/modules/shared/components/card";
import { cn } from "@/modules/shared";
import type { LucideIcon } from "lucide-react";

interface ProfileStatCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    subLabel?: string;
    /** Tailwind colour class applied to the icon background, e.g. "bg-emerald-500/10" */
    iconBg?: string;
    /** Tailwind colour class for the icon itself, e.g. "text-emerald-600" */
    iconColor?: string;
    className?: string;
}

export function ProfileStatCard({
    icon: Icon,
    label,
    value,
    subLabel,
    iconBg = "bg-primary/10",
    iconColor = "text-primary",
    className,
}: ProfileStatCardProps) {
    return (
        <Card
            className={cn(
                "transition-shadow duration-200 hover:shadow-md",
                className,
            )}
        >
            <CardContent className="p-5">
                <div className="flex items-start gap-3.5">
                    {/* Icon bubble */}
                    <div
                        className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                            iconBg,
                        )}
                    >
                        <Icon className={cn("w-5 h-5", iconColor)} />
                    </div>

                    {/* Value + label */}
                    <div className="min-w-0">
                        <p className="text-2xl font-bold text-foreground leading-none">
                            {value}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 leading-snug">
                            {label}
                        </p>
                        {subLabel && (
                            <p className="text-[10px] text-muted-foreground/60 mt-0.5 font-medium uppercase tracking-wide">
                                {subLabel}
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
