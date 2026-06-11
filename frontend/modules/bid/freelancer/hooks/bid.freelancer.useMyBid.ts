"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyBids } from "../api/bid.freelancer.api";
import { bidKeys } from "../../shared";

export function useMyBid(projectId: string, enabled: boolean) {
    return useQuery({
        queryKey: bidKeys.myBid(projectId),
        queryFn: async ({ signal }) => {
            const page = await getMyBids({ page: 0, size: 100 }, signal);
            return (
                page.content.find((bid) => bid.projectId === projectId) ?? null
            );
        },
        enabled: enabled && !!projectId,
    });
}
