"use client";

import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import type { ContractResponse, ContractStatus } from "../types/contract.shared";
import { contractKeys } from "./contract.keys";
import { PaginatedResponse } from "@/modules/shared/types";

function patchPageCache(qc: QueryClient, id: string, status: ContractStatus) {
    // Patch every cached "my" page variant (ALL, ACTIVE, etc.)
    qc.setQueriesData<PaginatedResponse<ContractResponse>>(
        { queryKey: contractKeys.all(), exact: false },
        (old) => {
            if (!old || !("content" in old)) return old;
            return {
                ...old,
                content: old.content.map((c) => (c.id === id ? { ...c, status } : c)),
            };
        },
    );
    // Patch the detail cache too
    qc.setQueryData<ContractResponse>(contractKeys.detail(id), (old) =>
        old ? { ...old, status } : old,
    );
}

function invalidateContract(qc: QueryClient, id: string) {
    return Promise.all([
        // Invalidate all "my" variants (any status filter, any page)
        qc.invalidateQueries({ queryKey: contractKeys.all(), exact: false }),
        qc.invalidateQueries({ queryKey: contractKeys.detail(id) }),
        qc.invalidateQueries({ queryKey: contractKeys.summary() }),
    ]);
}

type StatusMutationContext = {
    previousDetail: ContractResponse | undefined;
};

export function useContractStatusMutation(
    mutationFn: (id: string) => Promise<ContractResponse>,
    nextStatus: ContractStatus,
) {
    const qc = useQueryClient();

    return useMutation<ContractResponse, Error, string, StatusMutationContext>({
        mutationFn,

        onMutate: async (id): Promise<StatusMutationContext> => {
            // Cancel all in-flight contract queries
            await qc.cancelQueries({ queryKey: contractKeys.all() });

            const previousDetail = qc.getQueryData<ContractResponse>(contractKeys.detail(id));

            patchPageCache(qc, id, nextStatus);

            return { previousDetail };
        },

        onError: (_err, id, context) => {
            if (!context) return;
            // Re-fetch to restore — patching back is complex with page variants
            qc.invalidateQueries({ queryKey: contractKeys.all(), exact: false });
            qc.setQueryData(contractKeys.detail(id), context.previousDetail);
        },

        onSettled: (_data, _err, id) => {
            invalidateContract(qc, id);
        },
    });
}