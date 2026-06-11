"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateMilestoneRequest } from "../types/milestone.client";
import { createMilestone } from "../api/milestone.client.api";
import { milestoneKeys } from "../../shared";

export function useCreateMilestone(contractId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateMilestoneRequest) =>
      createMilestone(contractId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: milestoneKeys.list(contractId) });
    },
  });
}