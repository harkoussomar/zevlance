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