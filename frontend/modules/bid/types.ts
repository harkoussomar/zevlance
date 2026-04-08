// features/bids/types.ts

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
}

export interface CreateBidRequest {
    proposedPrice: number;
    coverLetter: string;
    estimatedDays: number;
}


export interface BidFilters {
    page?: number;
    size?: number;
}