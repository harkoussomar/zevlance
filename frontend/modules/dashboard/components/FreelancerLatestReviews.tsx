import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/components/card";
import { Avatar } from "@/modules/shared/components/avatar";
import { StarRating } from "@/modules/shared/components/star-rating";
import type { DashboardReviewItem } from "../types";
import { formatRelative } from "@/modules/shared";

interface Props {
    reviews: DashboardReviewItem[];
}

export function FreelancerLatestReviews({ reviews }: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Latest Reviews</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-5">
                {reviews.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-3">
                        No reviews yet. Complete a contract to receive your first review.
                    </p>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Avatar name={review.reviewerName} size="xs" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-foreground truncate">
                                        {review.reviewerName}
                                    </p>
                                    <StarRating rating={review.rating} />
                                </div>
                                <span className="text-[10px] text-muted-foreground shrink-0">
                                    {formatRelative(review.createdAt)}
                                </span>
                            </div>
                            {review.comment && (
                                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 italic">
                                    &ldquo;{review.comment}&rdquo;
                                </p>
                            )}
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}