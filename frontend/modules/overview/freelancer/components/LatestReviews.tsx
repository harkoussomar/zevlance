import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/modules/shared/components/card";
import { SmartAvatar } from "@/modules/shared/components/avatar";
import { StarRating } from "@/modules/shared/components/star-rating";
import { Star } from "lucide-react";
import type { OverviewReviewItem } from "../types/overview.freelancer";
import { formatRelative } from "@/modules/shared";

interface Props {
    reviews: OverviewReviewItem[];
}

export function LatestReviews({ reviews }: Props) {
    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-2 border-b border-border/60">
                <CardTitle className="text-sm font-bold">
                    Latest Reviews
                </CardTitle>
            </CardHeader>

            <CardContent className="p-4">
                {reviews.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
                            <Star className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground leading-snug">
                            Complete a contract to receive your first review.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <div key={review.id} className="space-y-2 group">
                                <div className="flex items-center gap-2.5">
                                    <SmartAvatar
                                        name={review.reviewerName}
                                        size="xs"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-foreground truncate">
                                            {review.reviewerName}
                                        </p>
                                        <StarRating rating={review.rating} />
                                    </div>
                                    <time className="text-[10px] text-muted-foreground/70 shrink-0 tabular-nums">
                                        {formatRelative(review.createdAt)}
                                    </time>
                                </div>

                                {review.comment && (
                                    <div className="pl-7 relative">
                                        {/* Vertical connector */}
                                        <div className="absolute left-3 top-0 bottom-0 w-px bg-border/60" />
                                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 italic bg-muted/30 rounded-lg px-3 py-2 border border-border/40">
                                            &ldquo;{review.comment}&rdquo;
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
