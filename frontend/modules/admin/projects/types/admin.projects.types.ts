import z from "zod";

// ── Summary (list page) ────────────────────────────────────────────────────────

export const ProjectSummarySchema = z.object({
    id: z.string(),
    title: z.string(),
    budgetMin: z.number().nullable().optional(),
    budgetMax: z.number().nullable().optional(),
    status: z.string(),
    category: z.string().nullable().optional(),
    requiredSkills: z.array(z.string()).default([]),
    deadline: z.string().nullable().optional(),
    clientId: z.string(),
    clientName: z.string().nullable().optional(),
    bidCount: z.number().default(0),
    flagged: z.boolean().default(false),
    featured: z.boolean().default(false),
    createdAt: z.string(),
    updatedAt: z.string().nullable().optional(),
});

export type ProjectSummary = z.infer<typeof ProjectSummarySchema>;

// ── Detail (detail page) ──────────────────────────────────────────────────────

export const BidSummarySchema = z.object({
    id: z.string(),
    freelancerId: z.string(),
    freelancerName: z.string(),
    amount: z.number(),
    status: z.string(),
    createdAt: z.string(),
});

export const ContractSummarySchema = z.object({
    id: z.string(),
    status: z.string(),
    freelancerId: z.string(),
    freelancerName: z.string(),
    agreedPrice: z.number(),
    startDate: z.string().nullable().optional(),
});

export const AdminProjectDetailSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    budgetMin: z.number(),
    budgetMax: z.number(),
    status: z.string(),
    category: z.string(),
    requiredSkills: z.array(z.string()),
    deadline: z.string(),
    clientId: z.string(),
    clientName: z.string(),
    clientEmail: z.string(),
    flagged: z.boolean(),
    featured: z.boolean(),
    adminNote: z.string().nullable().optional(),
    bidCount: z.number(),
    bids: z.array(BidSummarySchema).optional().default([]),
    contract: ContractSummarySchema.nullable().optional(),
    createdAt: z.string(),
    updatedAt: z.string().nullable().optional(),
});

export type BidSummary = z.infer<typeof BidSummarySchema>;
export type ContractSummary = z.infer<typeof ContractSummarySchema>;
export type AdminProjectDetail = z.infer<typeof AdminProjectDetailSchema>;

// ── Filter & params ────────────────────────────────────────────────────────────

export interface GetProjectsParams {
    page: number;
    size?: number;
    status?: string;
    clientId?: string;
    category?: string;
    flagged?: boolean;
    featured?: boolean;
    startDate?: string;
    endDate?: string;
    search?: string;
}

/** UI-only filter shape (no pagination). Spread with `page` to form GetProjectsParams. */
export interface AdminProjectFilter {
    status?: string;
    clientId?: string;
    category?: string;
    flagged?: boolean;
    featured?: boolean;
    startDate?: string;
    endDate?: string;
    search?: string;
}

// ── Action payloads ────────────────────────────────────────────────────────────

export interface ChangeStatusPayload {
    id: string;
    status: string;
    reason: string;
}

export interface FlagPayload {
    id: string;
    flagged: boolean;
    reason: string;
}

export interface FeaturePayload {
    id: string;
    featured: boolean;
}

// ── Status meta ────────────────────────────────────────────────────────────────

export const PROJECT_STATUSES = [
    "OPEN",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
    "SUSPENDED",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_CATEGORIES = [
    "WEB_DEV",
    "MOBILE",
    "DESIGN",
    "DATA_SCIENCE",
    "DEVOPS",
    "WRITING",
    "MARKETING",
    "OTHER",
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<string, string> = {
    WEB_DEV: "Web Dev",
    MOBILE: "Mobile",
    DESIGN: "Design",
    DATA_SCIENCE: "Data Science",
    DEVOPS: "DevOps",
    WRITING: "Writing",
    MARKETING: "Marketing",
    OTHER: "Other",
};