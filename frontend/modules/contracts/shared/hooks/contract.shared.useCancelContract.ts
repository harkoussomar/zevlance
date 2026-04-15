"use client";

import { cancelContract } from "../services/contract.shared";
import { useContractStatusMutation } from "./contract.shared.useContractStatusMutation";

export function useCancelContract() {
  return useContractStatusMutation(cancelContract, "CANCELLED");
}