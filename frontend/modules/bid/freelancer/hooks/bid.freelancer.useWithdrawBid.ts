"use client";

import {
    useMutation,
    useQueryClient,
    type QueryKey,
} from "@tanstack/react-query";
import { getMyBids, withdrawBid } from "../api/bid.freelancer.api";
import type { BidResponse } from "../../shared/types/bid.shared";
import { bidKeys } from "../../shared";

type MyBidsPage = Awaited<ReturnType<typeof getMyBids>>;
type WithdrawContext = {
    previousSnapshots: [QueryKey, MyBidsPage | undefined][];
};

export function useWithdrawBid() {
    const qc = useQueryClient();

    return useMutation<BidResponse, Error, string, WithdrawContext>({
        mutationFn: (bidId: string) => withdrawBid(bidId),

        onMutate: async (bidId): Promise<WithdrawContext> => {
            await qc.cancelQueries({ queryKey: bidKeys.mine() });

            const previousSnapshots = qc.getQueriesData<MyBidsPage>({
                queryKey: bidKeys.mine(),
            });

            qc.setQueriesData<MyBidsPage>(
                { queryKey: bidKeys.mine() },
                (old) => {
                    if (!old) return old;
                    return {
                        ...old,
                        content: old.content.map((bid) =>
                            bid.id === bidId
                                ? { ...bid, status: "WITHDRAWN" as const }
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
            qc.invalidateQueries({ queryKey: bidKeys.all() });
        },
    });
}
