"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { approveMilestone } from "../services/milestone.client";
import { milestoneKeys } from "../../shared";
import { contractKeys } from "@/modules/contracts/shared";

export function useApproveMilestone(contractId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (milestoneId: string) => approveMilestone(milestoneId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: milestoneKeys.list(contractId) });
      qc.invalidateQueries({ queryKey: contractKeys.detail(contractId) });
      qc.invalidateQueries({ queryKey: contractKeys.my() });
    },
  });
}