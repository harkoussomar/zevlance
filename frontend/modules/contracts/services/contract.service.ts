import api from "@/modules/shared/lib/axios";
import type { ContractResponse } from "../types";

// ─── My Contracts ─────────────────────────────────────────────────────────────

/**
 * Fetch all contracts for the authenticated user (CLIENT or FREELANCER).
 * @role    CLIENT | FREELANCER
 * @method  GET /contracts/my
 * @returns 200 OK — ContractResponse[] (not paginated)
 */
export function getMyContracts(signal?: AbortSignal): Promise<ContractResponse[]> {
  return api
    .get<ContractResponse[]>("/contracts/my", { signal })
    .then((res) => res.data);
}

// ─── Get Contract ─────────────────────────────────────────────────────────────

/**
 * Fetch a single contract by ID.
 * Only the client and freelancer who are party to the contract may access it.
 * @role    CLIENT | FREELANCER (party to the contract only)
 * @method  GET /contracts/{id}
 * @returns 200 OK — ContractResponse
 * @throws  403 — caller is not a party to this contract
 */
export function getContract(id: string, signal?: AbortSignal): Promise<ContractResponse> {
  return api
    .get<ContractResponse>(`/contracts/${id}`, { signal })
    .then((res) => res.data);
}

// ─── Complete Contract ────────────────────────────────────────────────────────

/**
 * Mark a contract as COMPLETED. Typically called after all milestones are approved.
 * @role    CLIENT only
 * @method  PUT /contracts/{id}/complete
 * @returns 200 OK — ContractResponse with status: "COMPLETED"
 */
export function completeContract(id: string): Promise<ContractResponse> {
  return api
    .put<ContractResponse>(`/contracts/${id}/complete`, undefined)
    .then((res) => res.data);
}

// ─── Cancel Contract ──────────────────────────────────────────────────────────

/**
 * Cancel an active contract. Either party may cancel.
 * @role    CLIENT | FREELANCER
 * @method  PUT /contracts/{id}/cancel
 * @returns 200 OK — ContractResponse with status: "CANCELLED"
 */
export function cancelContract(id: string): Promise<ContractResponse> {
  return api
    .put<ContractResponse>(`/contracts/${id}/cancel`, undefined)
    .then((res) => res.data);
}

// ─── Dispute Contract ─────────────────────────────────────────────────────────

/**
 * Open a dispute on an active contract. Either party may dispute.
 * Flags the contract for mediation and notifies both parties.
 * @role    CLIENT | FREELANCER
 * @method  PUT /contracts/{id}/dispute
 * @returns 200 OK — ContractResponse with status: "DISPUTED"
 */
export function disputeContract(id: string): Promise<ContractResponse> {
  return api
    .put<ContractResponse>(`/contracts/${id}/dispute`, undefined)
    .then((res) => res.data);
}