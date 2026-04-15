"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyContracts } from "../services/contract.shared";
import { contractKeys, type ContractListParams } from "./contract.keys";

export function useMyContracts(params: ContractListParams = {}) {
    return useQuery({
        queryKey: contractKeys.my(params),
        queryFn: ({ signal }) => getMyContracts(params, signal),
    });
}