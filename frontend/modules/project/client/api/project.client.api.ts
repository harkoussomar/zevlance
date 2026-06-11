import api from "@/modules/shared/lib/axios";
import type { PaginatedResponse } from "@/modules/shared/types";
import type {
    CreateProjectRequest,
    MyProjectFilters,
    UpdateProjectRequest,
} from "../types/project.client";
import type {
    ProjectResponse,
    ProjectSummaryResponse,
} from "../../shared/types/project.shared";

export async function getMyProjects(
    { page, size }: MyProjectFilters,
    signal?: AbortSignal,
): Promise<PaginatedResponse<ProjectSummaryResponse>> {
    const { data } = await api.get<PaginatedResponse<ProjectSummaryResponse>>(
        "/projects/my",
        {
            params: { page, size },
            signal,
        },
    );
    return data;
}

export async function createProject(
    payload: CreateProjectRequest,
    signal?: AbortSignal,
): Promise<ProjectResponse> {
    const { data } = await api.post<ProjectResponse>("/projects", payload, {
        signal,
    });
    return data;
}

export async function updateProject(
    id: string,
    payload: UpdateProjectRequest,
    signal?: AbortSignal,
): Promise<ProjectResponse> {
    const { data } = await api.put<ProjectResponse>(
        `/projects/${id}`,
        payload,
        { signal },
    );
    return data;
}

export async function cancelProject(
    id: string,
    signal?: AbortSignal,
): Promise<void> {
    await api.put(`/projects/${id}/cancel`, undefined, { signal });
}
