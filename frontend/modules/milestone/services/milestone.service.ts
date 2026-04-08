// ─── features/contracts/services/milestone.service.ts ─────────────────────────

import api from "@/modules/shared/lib/axios";
import type {
    MilestoneResponse,
    CreateMilestoneRequest,
    SubmitDeliverableRequest,
} from "../types";

// ─── List ──────────────────────────────────────────────────────────────────────

/**
 * Fetch all milestones for a given contract.
 * Both the client and the freelancer on the contract may call this.
 *
 * @role    CLIENT | FREELANCER (party to the contract)
 * @method  GET /contracts/{contractId}/milestones
 * @returns 200 OK — MilestoneResponse[]
 */
export async function getContractMilestones(
    contractId: string,
): Promise<MilestoneResponse[]> {
    const { data } = await api.get<MilestoneResponse[]>(
        `/contracts/${contractId}/milestones`,
    );
    return data;
}

// ─── Create ────────────────────────────────────────────────────────────────────

/**
 * Add a new milestone to a contract.
 * Only the client who owns the contract may call this.
 *
 * @role    CLIENT only
 * @method  POST /contracts/{contractId}/milestones
 * @returns 201 Created — MilestoneResponse with status: "PENDING"
 */
export async function createMilestone(
    contractId: string,
    payload: CreateMilestoneRequest,
): Promise<MilestoneResponse> {
    const { data } = await api.post<MilestoneResponse>(
        `/contracts/${contractId}/milestones`,
        payload,
    );
    return data;
}

// ─── Submit Deliverable ────────────────────────────────────────────────────────

/**
 * Submit a deliverable URL for a milestone.
 * Transitions the milestone from PENDING or REVISION_REQUESTED → SUBMITTED.
 *
 * @role    FREELANCER only
 * @method  PUT /milestones/{id}/submit
 * @returns 200 OK — MilestoneResponse with status: "SUBMITTED"
 */
export async function submitDeliverable(
    milestoneId: string,
    payload: SubmitDeliverableRequest,
): Promise<MilestoneResponse> {
    const { data } = await api.put<MilestoneResponse>(
        `/milestones/${milestoneId}/submit`,
        payload,
    );
    return data;
}

// ─── Approve ───────────────────────────────────────────────────────────────────

/**
 * Approve a submitted milestone.
 * Transitions the milestone from SUBMITTED → APPROVED.
 * If all milestones are now APPROVED, the contract auto-completes on the server.
 *
 * @role    CLIENT only
 * @method  PUT /milestones/{id}/approve
 * @returns 200 OK — MilestoneResponse with status: "APPROVED"
 */
export async function approveMilestone(
    milestoneId: string,
): Promise<MilestoneResponse> {
    const { data } = await api.put<MilestoneResponse>(
        `/milestones/${milestoneId}/approve`,
    );
    return data;
}

// ─── Request Revision ──────────────────────────────────────────────────────────

/**
 * Request a revision on a submitted milestone.
 * Transitions the milestone from SUBMITTED → REVISION_REQUESTED.
 * The freelancer can then re-submit a corrected deliverable.
 *
 * @role    CLIENT only
 * @method  PUT /milestones/{id}/revision
 * @returns 200 OK — MilestoneResponse with status: "REVISION_REQUESTED"
 */
export async function requestRevision(
    milestoneId: string,
): Promise<MilestoneResponse> {
    const { data } = await api.put<MilestoneResponse>(
        `/milestones/${milestoneId}/revision`,
    );
    return data;
}