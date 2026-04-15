"use client";

import { useQueries } from "@tanstack/react-query";
import { getContractMilestones } from "../services/milestone.shared";
import { milestoneKeys } from "./milestone.keys";

export function useActiveContractsMilestones(contractIds: string[]) {
  return useQueries({
    queries: contractIds.map((contractId) => ({
      queryKey: milestoneKeys.list(contractId),
      queryFn: () => getContractMilestones(contractId),
      enabled: Boolean(contractId),
    })),
  });
}