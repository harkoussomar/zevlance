"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateBidRequest } from "../types/bid.freelancer";
import { createBid } from "../services/bid.freelancer.service";
import { bidKeys } from "../../shared";


export function useCreateBid(projectId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBidRequest) => createBid(projectId, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: bidKeys.all() });
    },
  });
}