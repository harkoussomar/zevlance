"use client";

import {
    useMutation,
    useQueryClient,
    type QueryKey,
} from "@tanstack/react-query";
import { acceptBid, getProjectBids } from "../api/bid.client.api";
import type { ContractResponse } from "@/modules/contracts/shared";
import { bidKeys } from "../../shared";

type ProjectBidsPage = Awaited<ReturnType<typeof getProjectBids>>;
type AcceptContext = {
    previousSnapshots: [QueryKey, ProjectBidsPage | undefined][];
};

export function useAcceptBid(projectId: string) {
    const qc = useQueryClient();

    return useMutation<ContractResponse, Error, string, AcceptContext>({
        mutationFn: (id: string) => acceptBid(id),

        onMutate: async (bidId): Promise<AcceptContext> => {
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
                                ? { ...bid, status: "ACCEPTED" as const }
                                : { ...bid, status: "REJECTED" as const },
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
