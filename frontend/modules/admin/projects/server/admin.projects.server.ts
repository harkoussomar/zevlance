import type { PaginatedResponse } from "@/modules/shared/types";
import type {
    AdminProjectDetail,
    ChangeStatusPayload,
    FeaturePayload,
    FlagPayload,
    GetProjectsParams,
    ProjectSummary,
} from "../types/admin.projects.types";
import { serverFetch } from "@/modules/shared/lib/bff/server-fetch";

function buildQs(params: Record<string, string | number | boolean | undefined | null>): string {
    const qs = new URLSearchParams();
    for (const [key, val] of Object.entries(params)) {
        if (val !== undefined && val !== null && val !== "") {
            qs.set(key, String(val));
        }
    }
    return qs.toString();
}

// ── List ──────────────────────────────────────────────────────────────────────

export function getAdminProjectsServer(params: GetProjectsParams): Promise<PaginatedResponse<ProjectSummary>> {
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

    return serverFetch<PaginatedResponse<ProjectSummary>>(`/admin/projects?${qs}`);
}

// ── Detail ────────────────────────────────────────────────────────────────────

export function getAdminProjectDetailServer(id: string): Promise<AdminProjectDetail> {
    return serverFetch<AdminProjectDetail>(`/admin/projects/${id}`);
}

// ── Actions ───────────────────────────────────────────────────────────────────

export function changeProjectStatusServer({ id, status, reason }: ChangeStatusPayload): Promise<void> {
    return serverFetch(`/admin/projects/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, reason }),
    });
}

export function flagProjectServer({ id, flagged, reason }: FlagPayload): Promise<void> {
    return serverFetch(`/admin/projects/${id}/flag`, {
        method: "PATCH",
        body: JSON.stringify({ flagged, reason }),
    });
}

export function featureProjectServer({ id, featured }: FeaturePayload): Promise<void> {
    return serverFetch(`/admin/projects/${id}/feature`, {
        method: "PATCH",
        body: JSON.stringify({ featured }),
    });
}

export function deleteProjectServer(id: string, reason: string): Promise<void> {
    return serverFetch(`/admin/projects/${id}`, {
        method: "DELETE",
        body: JSON.stringify({ reason }),
    });
}