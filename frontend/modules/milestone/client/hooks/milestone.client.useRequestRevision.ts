"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { requestRevision } from "../api/milestone.client.api";
import { milestoneKeys } from "../../shared";

export function useRequestRevision(contractId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (milestoneId: string) => requestRevision(milestoneId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: milestoneKeys.list(contractId) });
    },
  });
}