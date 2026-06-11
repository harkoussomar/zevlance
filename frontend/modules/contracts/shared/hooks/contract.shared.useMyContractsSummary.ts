"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyContractsSummary } from "../api/contract.shared.api";
import { contractKeys } from "./contract.keys";

export function useMyContractsSummary() {
    return useQuery({
        queryKey: contractKeys.summary(),
        queryFn: ({ signal }) => getMyContractsSummary(signal),
    });
}
