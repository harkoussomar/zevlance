// ─── Enums ────────────────────────────────────────────────────────────────────

export type Role = "CLIENT" | "FREELANCER" | "ADMIN";

export type ProjectStatus = "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type ProjectCategory =
  | "WEB_DEV"
  | "MOBILE"
  | "DESIGN"
  | "DATA_SCIENCE"
  | "DEVOPS"
  | "WRITING"
  | "MARKETING"
  | "OTHER";

export type BidStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";

export type ContractStatus =
  | "ACTIVE"
  | "COMPLETED"
  | "DISPUTED"
  | "CANCELLED";

export type MilestoneStatus =
  | "PENDING"
  | "SUBMITTED"
  | "APPROVED"
  | "REVISION_REQUESTED";


// ─── User ─────────────────────────────────────────────────────────────────────

export interface FreelancerProfile {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  hourlyRate: number | null;
  skills: string[];
  rating: number | null;
  profilePicture: string | null;
  phone: string | null;
  reviewCount: number;
  completedContracts: number;
}

export interface ClientProfile {
  id: string;
  name: string;
  email: string;
  companyName: string | null;
  companyDescription: string | null;
  website: string | null;
  phone: string | null;
  rating: number | null;
  reviewCount: number;
  totalProjectsPosted: number;
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export interface ProjectSummaryResponse {
  id: string;
  title: string;
  budgetMin: number;
  budgetMax: number;
  status: ProjectStatus;
  category: ProjectCategory;
  requiredSkills: string[];
  deadline: string;
  clientId: string;
  clientName: string;
  bidCount: number;
  createdAt: string | null;
}

export interface ProjectResponse extends ProjectSummaryResponse {
  description: string;
  clientCompany: string | null;
}

export interface CreateProjectRequest {
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  category: ProjectCategory;
  requiredSkills?: string[];
  deadline: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface ProjectFilters {
  page: number;
  size: number;
  category?: ProjectCategory | "";
  status?: ProjectStatus | "";
  budgetMin?: number | "";
  budgetMax?: number | "";
  skill?: string;
  search?: string;
}

// ─── Bids ─────────────────────────────────────────────────────────────────────

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
  submittedAt: string | null;
}

export interface CreateBidRequest {
  proposedPrice: number;
  coverLetter: string;
  estimatedDays: number;
}

// ─── Contracts ────────────────────────────────────────────────────────────────

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
  createdAt: string | null;
}

// ─── Milestones ───────────────────────────────────────────────────────────────

export interface MilestoneResponse {
  id: string;
  contractId: string;
  title: string;
  description: string | null;
  amount: number;
  status: MilestoneStatus;
  dueDate: string;
  deliverableUrl: string | null;
}

export interface CreateMilestoneRequest {
  title: string;
  description?: string;
  amount: number;
  dueDate: string;
}

export interface SubmitDeliverableRequest {
  deliverableUrl: string;
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export interface ReviewResponse {
  id: string;
  contractId: string;
  reviewerId: string;
  reviewerName: string;
  revieweeId: string;
  revieweeName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface CreateReviewRequest {
  rating: number;
  comment?: string;
}

// ─── API Error ────────────────────────────────────────────────────────────────

export interface ApiError {
  message?: string;
  error?: string;
  [field: string]: string | undefined;
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

export type SidebarItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Role[];
  badge?: number;
};

export type SelectOption = {
  value: string;
  label: string;
};