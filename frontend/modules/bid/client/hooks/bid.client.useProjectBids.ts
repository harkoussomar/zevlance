"use client";

import { useQuery } from "@tanstack/react-query";
import { getProjectBids } from "../services/bid.client.service";
import type { BidFilters } from "../../shared/types/bid.shared";
import { bidKeys } from "../../shared";


export function useProjectBids(projectId: string, filters: BidFilters) {
  return useQuery({
    queryKey: bidKeys.projectList(projectId, filters),
    queryFn: ({ signal }) => getProjectBids(projectId, filters, signal),
    enabled: !!projectId,
    placeholderData: (prev) => prev,
  });
}