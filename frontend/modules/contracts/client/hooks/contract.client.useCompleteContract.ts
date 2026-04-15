"use client";

import { useContractStatusMutation } from "../../shared/hooks/contract.shared.useContractStatusMutation";
import { completeContract } from "../services/contract.client";

export function useCompleteContract() {
  return useContractStatusMutation(completeContract, "COMPLETED");
}