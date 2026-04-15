"use client";

import { toast } from "sonner";
import { Star } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/components/card";
import { Separator } from "@/modules/shared/components/separator";
import { parseApiError } from "@/modules/shared";
import { useLeaveReview } from "../hooks/review.shared.useLeaveReview";
import { ReviewForm } from "./ReviewForm";

interface ContractReviewProps {
    contractId: string;
    revieweeName: string;
}

export function ContractReview({ contractId, revieweeName }: ContractReviewProps) {
    const { 
        mutateAsync: leaveReview, 
        isPending: submittingReview, 
        error: reviewError, 
        isSuccess: reviewSuccess 
    } = useLeaveReview(contractId);

    const reviewServerError = reviewError ? parseApiError(reviewError) : null;

    const handleReviewSubmit = async (payload: Parameters<typeof leaveReview>[0]) => {
        try {
            await leaveReview(payload);
            toast.success("Review submitted. Thank you!");
        } catch (err) {
            const status = (err as { response?: { status?: number } })?.response?.status;
            if (status === 409) {
                toast.error("You have already reviewed this contract");
            } else {
                toast.error(parseApiError(err));
            }
        }
    };

    return (
        <>
            <Separator />
            <Card>
                <CardHeader className="pb-3 pt-5 px-5">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Star className="w-4 h-4 text-muted-foreground" /> Leave a Review
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                        Rate your experience working with {revieweeName}
                    </p>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                    <ReviewForm
                        contractId={contractId}
                        revieweeName={revieweeName}
                        existingReview={reviewSuccess ? undefined : null}
                        isPending={submittingReview}
                        serverError={reviewServerError}
                        onSubmit={handleReviewSubmit}
                    />
                </CardContent>
            </Card>
        </>
    );
}