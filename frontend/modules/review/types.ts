export interface LeaveReviewRequest {
  rating: number; // 1–5
  comment?: string;
}


export interface ReviewResponse {
  id: string;
  contractId: string;
  reviewerId: string;
  reviewerName: string;
  revieweeId: string;
  revieweeName: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
}
