"use client";

import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { getProjectBids, rejectBid } from "../services/bid.client.service";
import type { BidResponse } from "../../shared/types/bid.shared";
import { bidKeys } from "../../shared";


type ProjectBidsPage = Awaited<ReturnType<typeof getProjectBids>>;
type RejectContext = {
  previousSnapshots: [QueryKey, ProjectBidsPage | undefined][];
};

export function useRejectBid(projectId: string) {
  const qc = useQueryClient();

  return useMutation<BidResponse, Error, string, RejectContext>({
    mutationFn: (id: string) => rejectBid(id),

    onMutate: async (bidId): Promise<RejectContext> => {
      await qc.cancelQueries({ queryKey: bidKeys.project(projectId) });

      const previousSnapshots = qc.getQueriesData<ProjectBidsPage>({
        queryKey: bidKeys.project(projectId),
      });

      qc.setQueriesData<ProjectBidsPage>(
        { queryKey: bidKeys.project(projectId) },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            content: old.content.map((bid) =>
              bid.id === bidId
                ? { ...bid, status: "REJECTED" as const }
                : bid,
            ),
          };
        },
      );

      return { previousSnapshots };
    },

    onError: (_err, _bidId, context) => {
      if (!context) return;
      for (const [queryKey, data] of context.previousSnapshots) {
        qc.setQueryData(queryKey, data);
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: bidKeys.project(projectId) });
    },
  });
}