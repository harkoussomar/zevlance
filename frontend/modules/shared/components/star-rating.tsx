import { cn } from "@/modules/shared";
import { Star } from "lucide-react";

interface StarRatingProps {
    rating: number;
    max?: number;
    size?: "sm" | "md";
    showValue?: boolean;
}

export function StarRating({
    rating,
    max = 5,
    size = "sm",
    showValue,
}: StarRatingProps) {
    const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
    return (
        <div className="flex items-center gap-1 ml-auto">
            <div className="flex gap-0.5">
                {Array.from({ length: max }).map((_, i) => (
                    <Star
                        key={i}
                        className={cn(
                            iconSize,
                            i < Math.round(rating)
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground/25 fill-muted-foreground/10",
                        )}
                    />
                ))}
            </div>
            {showValue && (
                <span className="text-xs font-semibold text-muted-foreground ml-1">
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
}
