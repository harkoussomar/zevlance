"use client";

import { useQuery } from "@tanstack/react-query";
import { getContract } from "../api/contract.shared.api";
import { contractKeys } from "./contract.keys";

export function useContract(id: string) {
    return useQuery({
        queryKey: contractKeys.detail(id),
        queryFn: ({ signal }) => getContract(id, signal),
        enabled: Boolean(id),
    });
}
