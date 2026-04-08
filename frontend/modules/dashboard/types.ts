// ─── features/dashboard/types.ts ──────────────────────────────────────────────

import { BidStatus } from "../bid/types";
import { ContractStatus } from "../contracts/types";
import { MilestoneStatus } from "../milestone/types";
import { ProjectStatus } from "../projects/types";

export interface MilestoneNextItem {
    title:   string;
    dueDate: string;
    status:  MilestoneStatus;
}

export interface MilestoneSummary {
    total:           number;
    approved:        number;
    nextMilestone:   MilestoneNextItem | null;
}

export interface DashboardContractItem {
    id:               string;
    projectTitle:     string;
    clientName?:      string;      // freelancer view
    freelancerName?:  string;      // client view
    agreedPrice:      number;
    status:           ContractStatus;
    milestoneSummary: MilestoneSummary;
}

export interface DashboardBidItem {
    id:            string;
    projectTitle:  string;
    proposedPrice: number;
    estimatedDays: number;
    status:        BidStatus;
}

export interface DashboardReviewItem {
    id:           string;
    reviewerName: string;
    rating:       number;
    comment:      string | null;
    createdAt:    string;
}

export interface DashboardProjectItem {
    id:             string;
    title:          string;
    status:         ProjectStatus;
    budgetMin:      number;
    budgetMax:      number;
    deadline:       string;
    bidCount:       number;
    requiredSkills: string[];
}

// ─── Freelancer ───────────────────────────────────────────────────────────────

export interface FreelancerDashboardStats {
    totalEarned:          number;
    activeContractsCount: number;
    pendingBidsCount:     number;
    avgRating:            number | null;
    reviewCount:          number;
}

export interface FreelancerDashboardResponse {
    stats:           FreelancerDashboardStats;
    activeContracts: DashboardContractItem[];
    recentBids:      DashboardBidItem[];
    latestReviews:   DashboardReviewItem[];
}

// ─── Client ───────────────────────────────────────────────────────────────────

export interface ClientDashboardStats {
    openProjectsCount:    number;
    activeContractsCount: number;
    totalBidsReceived:    number;
    totalSpent:           number;
}

export interface ClientDashboardResponse {
    stats:           ClientDashboardStats;
    recentProjects:  DashboardProjectItem[];
    activeContracts: DashboardContractItem[];
}