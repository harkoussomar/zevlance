"use client";

import { useQuery } from "@tanstack/react-query";
import { getContractMilestones } from "../services/milestone.shared";
import { milestoneKeys } from "./milestone.keys";

export function useContractMilestones(contractId: string) {
  return useQuery({
    queryKey: milestoneKeys.list(contractId),
    queryFn: () => getContractMilestones(contractId),
    enabled: Boolean(contractId),
  });
}