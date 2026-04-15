"use client";

import { disputeContract } from "../services/contract.shared";
import { useContractStatusMutation } from "./contract.shared.useContractStatusMutation";

export function useDisputeContract() {
  return useContractStatusMutation(disputeContract, "DISPUTED");
}