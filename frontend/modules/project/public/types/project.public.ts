import { ProjectCategory } from "../../shared";

export interface ProjectFilters {
  page: number;
  size: number;
  category?: ProjectCategory;
  budgetMin?: number;
  budgetMax?: number;
  skill?: string;
  query?: string;
}