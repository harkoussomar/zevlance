// ─── features/contracts/components/ReviewForm.tsx ─────────────────────────────

"use client";

import { useState } from "react";
import { Star, Send, CheckCircle2 } from "lucide-react";

import { Button } from "@/modules/shared/components/button";
import { Textarea } from "@/modules/shared/components/textarea";
import { FormField } from "@/modules/shared/components/form-field";
import { Alert } from "@/modules/shared/components/alert";
import { SmartAvatar } from "@/modules/shared/components/avatar";
import { cn } from "@/modules/shared";
import { LeaveReviewRequest, ReviewResponse } from "../types/review";

// ─── Star Rating Input ─────────────────────────────────────────────────────────

interface StarRatingInputProps {
    value: number;
    onChange: (value: number) => void;
    disabled?: boolean;
}

const ratingLabels: Record<number, string> = {
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very Good",
    5: "Excellent",
};

function StarRatingInput({ value, onChange, disabled }: StarRatingInputProps) {
    const [hovered, setHovered] = useState(0);
    const displayValue = hovered || value;

    return (
        <div className="space-y-2">
            <div
                className="flex gap-1"
                onMouseLeave={() => !disabled && setHovered(0)}
                role="radiogroup"
                aria-label="Rating"
            >
                {[1, 2, 3, 4, 5].map((n) => (
                    <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={value === n}
                        aria-label={`${n} star${n !== 1 ? "s" : ""}`}
                        disabled={disabled}
                        onMouseEnter={() => !disabled && setHovered(n)}
                        onClick={() => !disabled && onChange(n)}
                        className={cn(
                            "p-1 rounded-md transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            disabled
                                ? "cursor-not-allowed opacity-60"
                                : "cursor-pointer hover:scale-110",
                        )}
                    >
                        <Star
                            className={cn(
                                "w-7 h-7 transition-colors duration-100",
                                n <= displayValue
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-muted-foreground/30",
                            )}
                        />
                    </button>
                ))}
            </div>
            {displayValue > 0 && (
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400 h-4">
                    {ratingLabels[displayValue]}
                </p>
            )}
        </div>
    );
}

// ─── Review Submitted State ────────────────────────────────────────────────────

function ReviewSubmittedCard({ review }: { review: ReviewResponse }) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">Review submitted</span>
            </div>
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                        key={n}
                        className={cn(
                            "w-5 h-5",
                            n <= review.rating
                                ? "text-amber-400 fill-amber-400"
                                : "text-muted-foreground/20",
                        )}
                    />
                ))}
            </div>
            {review.comment && (
                <p className="text-sm text-muted-foreground italic">
                    &ldquo;{review.comment}&rdquo;
                </p>
            )}
        </div>
    );
}

// ─── ReviewForm ───────────────────────────────────────────────────────────────

interface ReviewFormProps {
    contractId: string;
    revieweeName: string;
    /** Pass the existing review to show a read-only "already reviewed" state */
    existingReview?: ReviewResponse | null;
    isPending: boolean;
    serverError?: string | null;
    onSubmit: (payload: LeaveReviewRequest) => void;
}

export function ReviewForm({
    revieweeName,
    existingReview,
    isPending,
    serverError,
    onSubmit,
}: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [ratingError, setRatingError] = useState<string | null>(null);

    if (existingReview) {
        return <ReviewSubmittedCard review={existingReview} />;
    }

    const handleSubmit = () => {
        if (!rating) {
            setRatingError("Please select a rating before submitting");
            return;
        }
        setRatingError(null);
        onSubmit({ rating, comment: comment.trim() || undefined });
    };

    return (
        <div className="space-y-5">
            {/* Reviewee identity */}
            <div className="flex items-center gap-3">
                <SmartAvatar name={revieweeName} size="sm" />
                <div>
                    <p className="text-sm font-semibold text-foreground">
                        {revieweeName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Share your experience
                    </p>
                </div>
            </div>

            {/* Server error */}
            {serverError && (
                <Alert variant="destructive" className="text-sm">
                    {serverError}
                </Alert>
            )}

            {/* Star rating */}
            <div className="space-y-1.5">
                <p className="text-sm font-medium text-foreground">Rating</p>
                <StarRatingInput
                    value={rating}
                    onChange={(v) => {
                        setRating(v);
                        if (ratingError) setRatingError(null);
                    }}
                    disabled={isPending}
                />
                {ratingError && (
                    <p className="text-xs text-destructive">{ratingError}</p>
                )}
            </div>

            {/* Comment */}
            <FormField label="Comment" hint="Optional — max 1000 characters">
                <Textarea
                    placeholder="Describe your experience working together…"
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    maxLength={1000}
                    disabled={isPending}
                />
                <p className="text-xs text-muted-foreground text-right mt-1">
                    {comment.length}/1000
                </p>
            </FormField>

            {/* Submit */}
            <Button
                size="sm"
                loading={isPending}
                disabled={isPending || !rating}
                onClick={handleSubmit}
                className="w-full"
            >
                <Send className="w-3.5 h-3.5" />
                Submit Review
            </Button>
        </div>
    );
}
