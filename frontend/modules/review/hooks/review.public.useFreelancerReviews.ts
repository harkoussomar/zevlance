"use client";

import { useQuery } from "@tanstack/react-query";
import { reviewKeys } from "./review.keys";
import { getFreelancerReviews } from "../api/review.api";

export function useFreelancerReviews(freelancerId: string) {
    return useQuery({
        queryKey: reviewKeys.freelancer(freelancerId),
        queryFn: () => getFreelancerReviews(freelancerId),
        enabled: Boolean(freelancerId),
    });
}
