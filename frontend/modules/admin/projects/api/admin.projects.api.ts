import { PaginatedResponse, PaginatedResponseSchema } from "@/modules/shared/types";
import {
    AdminProjectDetail,
    AdminProjectDetailSchema,
    ChangeStatusPayload,
    FeaturePayload,
    FlagPayload,
    GetProjectsParams,
    ProjectSummary,
    ProjectSummarySchema,
} from "../types/admin.projects.types";
import api from "@/modules/shared/lib/axios";

function buildQs(params: Record<string, string | number | boolean | undefined | null>): string {
    const qs = new URLSearchParams();
    for (const [key, val] of Object.entries(params)) {
        if (val !== undefined && val !== null && val !== "") {
            qs.set(key, String(val));
        }
    }
    return qs.toString();
}

export const adminProjectsApi = {
    // ── List ──────────────────────────────────────────────────────────────────

    getProjects: (params: GetProjectsParams, signal?: AbortSignal): Promise<PaginatedResponse<ProjectSummary>> => {
        const qs = buildQs({
            page: params.page,
            size: params.size ?? 20,
            status: params.status,
            clientId: params.clientId,
            category: params.category,
            flagged: params.flagged,
            featured: params.featured,
            startDate: params.startDate,
            endDate: params.endDate,
            search: params.search,
        });
        return api
            .get<PaginatedResponse<ProjectSummary>>(`/admin/projects?${qs}`, { signal })
            .then((r) => PaginatedResponseSchema(ProjectSummarySchema).parse(r.data));
    },

    // ── Detail ────────────────────────────────────────────────────────────────

    getProjectDetail: (id: string, signal?: AbortSignal): Promise<AdminProjectDetail> =>
        api
            .get<AdminProjectDetail>(`/admin/projects/${id}`, { signal })
            .then((r) => AdminProjectDetailSchema.parse(r.data)),

    // ── Actions ───────────────────────────────────────────────────────────────

    changeProjectStatus: ({ id, status, reason }: ChangeStatusPayload): Promise<void> =>
        api
            .patch(`/admin/projects/${id}/status`, { status, reason })
            .then(() => undefined),

    flagProject: ({ id, flagged, reason }: FlagPayload): Promise<void> =>
        api
            .patch(`/admin/projects/${id}/flag`, { flagged, reason })
            .then(() => undefined),

    featureProject: ({ id, featured }: FeaturePayload): Promise<void> =>
        api
            .patch(`/admin/projects/${id}/feature`, { featured })
            .then(() => undefined),

    deleteProject: (id: string, reason: string): Promise<void> =>
        api
            .delete(`/admin/projects/${id}`, { data: { reason } })
            .then(() => undefined),
};