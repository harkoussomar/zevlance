export type MilestoneStatus =
  | "PENDING"             // created, awaiting escrow funding
  | "FUNDED"              // client paid into escrow, freelancer can now work
  | "SUBMITTED"           // freelancer submitted deliverableUrl
  | "APPROVED"            // client approved → funds released to freelancer
  | "REVISION_REQUESTED"  // client requested changes (max 3 times)
  | "DISPUTED"            // escalated after 3 revisions or manual dispute
  | "REFUNDED";           // refunded to client

export interface CreateMilestoneRequest {
  title: string;
  description?: string;
  amount: number;
  dueDate: string;
}

export interface SubmitDeliverableRequest {
  deliverableUrl: string;
}

export interface MilestoneResponse {
  id: string;
  contractId: string;
  title: string;
  description?: string | null;
  amount: number;
  status: MilestoneStatus;
  dueDate: string;
  deliverableUrl?: string | null;
  // Payment fields
  platformFeeAmount: number;
  freelancerPayout: number;
  fundedAt: string | null;
  releasedAt: string | null;
  revisionCount: number;
}