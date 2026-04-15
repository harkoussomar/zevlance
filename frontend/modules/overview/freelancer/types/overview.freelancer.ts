import type { BidStatus } from "@/modules/bid/shared";
import type { ContractStatus } from "@/modules/contracts/shared";
import type { MilestoneStatus } from "@/modules/milestone/shared";

export interface MilestoneNextItem {
    title: string;
    dueDate: string;
    status: MilestoneStatus;
}

export interface MilestoneSummary {
    total: number;
    approved: number;
    nextMilestone: MilestoneNextItem | null;
}

export interface OverviewContractItem {
    id: string;
    projectTitle: string;
    clientName?: string;
    freelancerName?: string;
    agreedPrice: number;
    status: ContractStatus;
    milestoneSummary: MilestoneSummary;
}

export interface OverviewBidItem {
    id: string;
    projectTitle: string;
    proposedPrice: number;
    estimatedDays: number;
    status: BidStatus;
}

export interface OverviewReviewItem {
    id: string;
    reviewerName: string;
    rating: number;
    comment: string | null;
    createdAt: string;
}

// ─── Freelancer ───────────────────────────────────────────────────────────────

export interface FreelancerOverviewStats {
    totalEarned: number;
    activeContractsCount: number;
    pendingBidsCount: number;
    avgRating: number | null;
    reviewCount: number;
}

export interface FreelancerOverviewResponse {
    user: { id: string; name: string };
    stats: FreelancerOverviewStats;
    activeContracts: OverviewContractItem[];
    recentBids: OverviewBidItem[];
    latestReviews: OverviewReviewItem[];
}

