import { useQuery } from "@tanstack/react-query";
import { getMyBidsSummary } from "../api/bid.freelancer.api";
import { bidKeys } from "../../shared";
import type { BidSummaryResponse } from "../../shared";

const EMPTY_SUMMARY: BidSummaryResponse = {
    pending: 0,
    accepted: 0,
    rejected: 0,
    withdrawn: 0,
    totalValue: 0,
    successRate: 0,
};

export function useMyBidsSummary() {
    const query = useQuery({
        queryKey: bidKeys.mySummary(),
        queryFn: ({ signal }) => getMyBidsSummary(signal),
        staleTime: 30_000,
    });

    return {
        ...query,
        summary: query.data ?? EMPTY_SUMMARY,
    };
}
