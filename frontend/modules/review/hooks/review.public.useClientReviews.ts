"use client";

import { useQuery } from "@tanstack/react-query";
import { reviewKeys } from "./review.keys";
import { getClientReviews } from "../services/review.service";

export function useClientReviews(clientId: string) {
  return useQuery({
    queryKey: reviewKeys.client(clientId),
    queryFn:  () => getClientReviews(clientId),
    enabled:  Boolean(clientId),
  });
}