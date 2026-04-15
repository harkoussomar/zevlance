import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/modules/shared/components/card";
import { SmartAvatar } from "@/modules/shared/components/avatar";
import { cn } from "@/modules/shared";
import type { ReviewResponse } from "@/modules/review";

// ─── Inline star display ──────────────────────────────────────────────────────

function StarDisplay({
    rating,
    size = "sm",
}: {
    rating: number;
    size?: "sm" | "md";
}) {
    const dim = size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
                <Star
                    key={n}
                    className={cn(
                        dim,
                        n <= rating
                            ? "text-amber-400 fill-amber-400"
                            : "text-muted-foreground/20",
                    )}
                />
            ))}
        </div>
    );
}

// ─── Relative time helper ─────────────────────────────────────────────────────

function relativeTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86_400_000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30)
        return `${Math.floor(days / 7)} week${Math.floor(days / 7) !== 1 ? "s" : ""} ago`;
    if (days < 365)
        return `${Math.floor(days / 30)} month${Math.floor(days / 30) !== 1 ? "s" : ""} ago`;
    return `${Math.floor(days / 365)} year${Math.floor(days / 365) !== 1 ? "s" : ""} ago`;
}

// ─── ProfileReviewCard ────────────────────────────────────────────────────────

interface ProfileReviewCardProps {
    review: ReviewResponse;
}

export function ProfileReviewCard({ review }: ProfileReviewCardProps) {
    return (
        <Card className="relative overflow-hidden transition-shadow duration-200 hover:shadow-md">
            {/* Subtle left accent bar keyed to rating */}
            <div
                className={cn(
                    "absolute left-0 top-0 bottom-0 w-0.5",
                    review.rating >= 4
                        ? "bg-emerald-500"
                        : review.rating === 3
                          ? "bg-amber-400"
                          : "bg-destructive",
                )}
            />
            <CardContent className="p-5 pl-6">
                <div className="flex items-start justify-between gap-4">
                    {/* Reviewer identity */}
                    <div className="flex items-center gap-2.5 min-w-0">
                        <SmartAvatar name={review.reviewerName} size="sm" />
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">
                                {review.reviewerName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {relativeTime(review.createdAt)}
                            </p>
                        </div>
                    </div>

                    {/* Rating */}
                    <div className="shrink-0">
                        <StarDisplay rating={review.rating} />
                    </div>
                </div>

                {/* Comment */}
                {review.comment && (
                    <div className="mt-3 relative">
                        <Quote className="w-4 h-4 text-muted-foreground/30 absolute -top-1 -left-1" />
                        <p className="text-sm text-muted-foreground leading-relaxed pl-4 italic">
                            {review.comment}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// ─── Star Display export ───────────────────────────────────────────────────────
export { StarDisplay };
