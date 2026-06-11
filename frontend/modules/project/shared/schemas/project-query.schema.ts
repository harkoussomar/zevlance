import { z } from "zod";

const PROJECT_CATEGORIES = [
    "WEB_DEV",
    "MOBILE",
    "DESIGN",
    "DATA_SCIENCE",
    "DEVOPS",
    "WRITING",
    "MARKETING",
    "OTHER",
] as const;

const PROJECT_STATUSES = [
    "OPEN",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
] as const;

export const projectQuerySchema = z.object({
    page: z.coerce.number().min(0).default(0),
    size: z.coerce.number().min(1).max(100).default(10),
    category: z.enum(PROJECT_CATEGORIES).optional(),
    status: z.enum(PROJECT_STATUSES).optional(),
    search: z.string().max(200).optional(),
    sort: z.string().max(50).optional(),
    minBudget: z.coerce.number().min(0).optional(),
    maxBudget: z.coerce.number().min(0).optional(),
});

export type ProjectQueryParams = z.infer<typeof projectQuerySchema>;
