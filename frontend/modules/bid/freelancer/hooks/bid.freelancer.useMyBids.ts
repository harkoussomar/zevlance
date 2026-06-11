import { useQuery } from "@tanstack/react-query";
import { getMyBids } from "../api/bid.freelancer.api";
import { bidKeys } from "../../shared";
import type { BidFilters } from "../../shared";

export function useMyBids(filters: BidFilters) {
    return useQuery({
        queryKey: bidKeys.myList(filters),
        queryFn: ({ signal }) => getMyBids(filters, signal),
    });
}
