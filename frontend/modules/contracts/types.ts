

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
}



// ─── UI-Only helpers ──────────────────────────────────────────────────────────

export type ContractActionType =
  | "complete"
  | "cancel"
  | "dispute"
  | "fund"      // fund a specific milestone via Stripe Checkout
  | "refund";   // refund a funded milestone back to the client
 

export interface ConfirmDialogState {
  open: boolean;
  type: ContractActionType;
  title: string;
  description: string;
}