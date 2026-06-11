"use client";

import { cancelContract } from "../api/contract.shared.api";
import { useContractStatusMutation } from "./contract.shared.useContractStatusMutation";

export function useCancelContract() {
    return useContractStatusMutation(cancelContract, "CANCELLED");
}
