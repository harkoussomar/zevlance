export type BidStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";

export interface BidResponse {
  id: string;
  projectId: string;
  projectTitle: string;
  freelancerId: string;
  freelancerName: string;
  proposedPrice: number;
  coverLetter: string;
  estimatedDays: number;
  status: BidStatus;
  submittedAt: string;
  contractId: string | null;
}

export interface BidFilters {
    page: number;
    size: number;
    status?: BidStatus;
}



export interface BidSummaryResponse {
    pending: number;
    accepted: number;
    rejected: number;
    withdrawn: number;
    totalValue: number;
    successRate: number;
}