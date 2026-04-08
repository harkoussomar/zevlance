export type NotificationType =
  | 'BID_RECEIVED'
  | 'BID_ACCEPTED'
  | 'BID_REJECTED'
  | 'BID_WITHDRAWN'
  | 'CONTRACT_CREATED'
  | 'CONTRACT_COMPLETED'
  | 'CONTRACT_CANCELLED'
  | 'CONTRACT_DISPUTED'
  | 'MILESTONE_FUNDED'
  | 'MILESTONE_SUBMITTED'
  | 'MILESTONE_APPROVED'
  | 'MILESTONE_REVISION_REQUESTED'
  | 'MILESTONE_DISPUTED'
  | 'PAYMENT_RELEASED'
  | 'PAYMENT_REFUNDED'
  | 'WELCOME'
  | 'EMAIL_VERIFICATION'
  | 'PASSWORD_RESET';

export type ReferenceType = 'BID' | 'CONTRACT' | 'MILESTONE' | 'PAYMENT';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  referenceId: string | null;
  referenceType: ReferenceType | null;
  createdAt: string;
}

export interface NotificationsPage {
  content: Notification[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface UnreadCountResponse {
  count: number;
}