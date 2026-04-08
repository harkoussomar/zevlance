// ─── features/profile/components/ProfileReviewsSection.tsx ────────────────────

import { MessageSquare, Star } from "lucide-react";
import { Separator } from "@/modules/shared/components/separator";
import { EmptyState } from "@/modules/shared/components/empty-state";
import { ProfileReviewCard } from "./ProfileReviewCard";
import type { ReviewResponse } from "@/modules/review/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProfileReviewsSectionProps {
    reviews: ReviewResponse[];
}

// ─── Rating breakdown widget ──────────────────────────────────────────────────

function RatingBreakdown({ reviews }: { reviews: ReviewResponse[] }) {
    if (reviews.length === 0) return null;

    const counts = [5, 4, 3, 2, 1].map((n) => ({
        star: n,
        count: reviews.filter((r) => r.rating === n).length,
    }));
    const max = Math.max(...counts.map((c) => c.count), 1);
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

    return (
        <div className="flex items-start gap-6 p-4 rounded-xl bg-muted/40 border border-border/60">
            {/* Average */}
            <div className="text-center shrink-0">
                <p className="text-4xl font-bold text-foreground leading-none">
                    {avg.toFixed(1)}
                </p>
                <div className="flex items-center justify-center gap-0.5 mt-1.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                            key={n}
                            className={`w-3.5 h-3.5 ${
                                n <= Math.round(avg)
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-muted-foreground/20"
                            }`}
                        />
                    ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                </p>
            </div>

            <Separator orientation="vertical" className="h-16 self-center" />

            {/* Bar breakdown */}
            <div className="flex-1 space-y-1.5">
                {counts.map(({ star, count }) => {
                    const pct = Math.round((count / max) * 100);
                    return (
                        <div key={star} className="flex items-center gap-2 text-xs">
                            <span className="w-4 text-right text-muted-foreground font-medium">
                                {star}
                            </span>
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                            <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                                <div
                                    className="h-full bg-amber-400 rounded-full"
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                            <span className="w-4 text-muted-foreground">{count}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── ProfileReviewsSection ────────────────────────────────────────────────────

export function ProfileReviewsSection({ reviews }: ProfileReviewsSectionProps) {
    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <h2 className="font-semibold text-foreground text-sm">Reviews</h2>
                <span className="text-sm text-muted-foreground">
                    ({reviews.length})
                </span>
            </div>

            {/* Content */}
            {reviews.length === 0 ? (
                <EmptyState
                    icon={<MessageSquare className="w-7 h-7" />}
                    title="No reviews yet"
                    description="Reviews will appear here after contracts are completed."
                />
            ) : (
                <>
                    <RatingBreakdown reviews={reviews} />
                    <div className="space-y-3">
                        {reviews.map((review) => (
                            <ProfileReviewCard key={review.id} review={review} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}