"use client";

import { useContractStatusMutation } from "../../shared/hooks/contract.shared.useContractStatusMutation";
import { completeContract } from "../api/contract.client.api";

export function useCompleteContract() {
  return useContractStatusMutation(completeContract, "COMPLETED");
}