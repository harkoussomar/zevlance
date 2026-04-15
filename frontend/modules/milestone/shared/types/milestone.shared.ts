export type MilestoneStatus =
  | "PENDING"
  | "FUNDED"
  | "SUBMITTED"
  | "APPROVED"
  | "REVISION_REQUESTED"
  | "DISPUTED"
  | "REFUNDED";

export interface MilestoneResponse {
  id: string;
  contractId: string;
  title: string;
  description?: string | null;
  amount: number;
  status: MilestoneStatus;
  dueDate: string;
  deliverableUrl?: string | null;
  platformFeeAmount: number;
  freelancerPayout: number;
  fundedAt: string | null;
  releasedAt: string | null;
  revisionCount: number;
}