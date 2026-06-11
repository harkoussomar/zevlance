import "server-only";
import { serverFetch } from "@/modules/shared/lib/bff/server-fetch";
import type { PaginatedResponse } from "@/modules/shared/types";
import type {
    ProjectResponse,
    ProjectSummaryResponse,
} from "../types/project.shared";
import type { ProjectFormValues } from "../../client/schema/create.project.schema";

export async function getProjectsServer(
    qs?: string,
): Promise<PaginatedResponse<ProjectSummaryResponse>> {
    return await serverFetch<PaginatedResponse<ProjectSummaryResponse>>(
        `/projects${qs ? `?${qs}` : ""}`,
    );
}

export async function createProjectServer(
    body: ProjectFormValues,
): Promise<ProjectResponse> {
    return await serverFetch<ProjectResponse>("/projects", {
        method: "POST",
        body: JSON.stringify(body),
    });
}

export async function getMyProjectsServer(
    qs?: string,
): Promise<PaginatedResponse<ProjectSummaryResponse>> {
    return await serverFetch<PaginatedResponse<ProjectSummaryResponse>>(
        `/projects/my${qs ? `?${qs}` : ""}`,
    );
}

export async function getProjectServer(id: string): Promise<ProjectResponse> {
    return await serverFetch<ProjectResponse>(`/projects/${id}`);
}

export async function updateProjectServer(
    id: string,
    body: unknown,
): Promise<ProjectResponse> {
    return await serverFetch<ProjectResponse>(`/projects/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
    });
}

export async function cancelProjectServer(id: string): Promise<void> {
    await serverFetch(`/projects/${id}/cancel`, { method: "PUT" });
}
