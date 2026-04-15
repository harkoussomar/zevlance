export interface CreateMilestoneRequest {
  title: string;
  description?: string;
  amount: number;
  dueDate: string;
}