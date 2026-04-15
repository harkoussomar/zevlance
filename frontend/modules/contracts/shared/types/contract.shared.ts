export type ContractStatus = "ACTIVE" | "COMPLETED" | "CANCELLED" | "DISPUTED";

export interface ContractResponse {
    id: string;
    bidId: string;
    projectId: string;
    projectTitle: string;
    freelancerId: string;
    freelancerName: string;
    clientId: string;
    clientName: string;
    status: ContractStatus;
    agreedPrice: number;
    startDate: string;
    endDate: string | null;
    createdAt: string;

    // ── Milestone aggregates ──────────────────────────────────────────────────
    /** Total number of milestones defined on this contract. */
    totalMilestones: number;
    /** Number of milestones with status APPROVED. */
    approvedMilestones: number;
    /** Number of milestones with status SUBMITTED (awaiting client review). */
    pendingReviewCount: number;
    /** Sum of all milestone amounts regardless of status. */
    totalAllocated: number;
    /** Sum of APPROVED milestone amounts — total the client has paid out. */
    clientTotalReleased: number;
    /** Sum of APPROVED milestone freelancerPayout values — total the freelancer has earned. */
    freelancerTotalEarned: number;
}



// ─── Summary ─────────────────────────────────────────────────────────────────

/** Returned by GET /contracts/my/summary — full-history aggregates, pagination-independent */
export interface ContractSummaryResponse {
    totalContracts: number;
    activeCount: number;
    completedCount: number;
    disputedCount: number;
    cancelledCount: number;
    activeValue: number;
    clientTotalReleased: number;
    freelancerTotalEarned: number;
}