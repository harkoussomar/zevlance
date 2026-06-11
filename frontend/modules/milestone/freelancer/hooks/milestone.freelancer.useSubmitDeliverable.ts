"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitDeliverable } from "../api/milestone.freelancer.api";
import { milestoneKeys } from "../../shared";

export function useSubmitDeliverable(contractId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      milestoneId,
      deliverableUrl,
    }: {
      milestoneId: string;
      deliverableUrl: string;
    }) => submitDeliverable(milestoneId, { deliverableUrl }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: milestoneKeys.list(contractId) });
    },
  });
}