"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { LeaveReviewRequest } from "../types/review";
import { leaveReview } from "../api/review.api";
import { contractKeys } from "@/modules/contracts/shared";

export function useLeaveReview(contractId: string) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (payload: LeaveReviewRequest) =>
            leaveReview(contractId, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: contractKeys.detail(contractId) });
        },
    });
}
