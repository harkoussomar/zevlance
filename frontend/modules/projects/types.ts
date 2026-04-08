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


export interface MyProjectFilters {
  page?: number;
  size?: number;
}

export interface CreateProjectRequest {
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  category: string;
  requiredSkills?: string[];
  deadline: string;
}

export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  budgetMin?: number;
  budgetMax?: number;
  category?: string;
  requiredSkills?: string[];
  deadline?: string;
}

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