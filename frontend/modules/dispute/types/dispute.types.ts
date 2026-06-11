// dispute/types/dispute.types.ts

export type DisputeStatus = "OPEN" | "ESCALATED" | "RESOLVED";

export type DisputeCategory =
  | "DELIVERABLE_QUALITY"
  | "NON_DELIVERY"
  | "SCOPE_CHANGE"
  | "PAYMENT_ISSUE"
  | "UNRESPONSIVE"
  | "OTHER";

export type DisputeOutcome = "FREELANCER_WINS" | "CLIENT_WINS";

export interface DisputeMessageResponse {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  message: string;
  isSystemMessage: boolean;
  createdAt: string;
}

export interface DisputeEvidenceResponse {
  id: string;
  uploaderId: string;
  uploaderName: string;
  fileUrl: string;
  fileName: string;
  description: string;
  createdAt: string;
}

export interface AdminRuling {
  adminId: string;
  adminName: string;
  outcome: DisputeOutcome;
  explanation: string;
  resolvedAt: string;
}

export interface DisputeDetailsResponse {
  id: string;
  contractId: string;
  initiatorId: string;
  initiatorName: string;   // who filed it — for display in info panel
  reason: string;
  category?: DisputeCategory;  // backend-ready; populated going forward
  status: DisputeStatus;
  createdAt: string;
  escalatedAt?: string;        // when it was escalated
  autoEscalateAt?: string;     // deadline before admin auto-escalates
  resolvedAt?: string;         // when admin closed it
  ruling?: AdminRuling;        // populated only when RESOLVED
  messages: DisputeMessageResponse[];
  evidence: DisputeEvidenceResponse[];
}

// ─── Client-only payloads ─────────────────────────────────────────────────────

export interface ResolveDisputePayload {
  outcome: DisputeOutcome;
  explanation: string;
}

export interface FileDisputePayload {
  reason: string;
  category: DisputeCategory;
}
