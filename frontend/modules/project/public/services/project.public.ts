import api from "@/modules/shared/lib/axios";
import type { PaginatedResponse } from "@/modules/shared/types";
import type { ProjectFilters } from "../types/project.public";
import type { ProjectResponse, ProjectSummaryResponse } from "../../shared/types/project.shared";

export async function getProjects(filters: ProjectFilters, signal?: AbortSignal) {
    const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v != null && v !== "")
    );
    console.log("→ getProjects params", params);
    const { data } = await api.get<PaginatedResponse<ProjectSummaryResponse>>("/projects", {
        params,
        signal,
    });
    return data;
}

export async function getProject(id: string, signal?: AbortSignal): Promise<ProjectResponse> {
    const { data } = await api.get<ProjectResponse>(`/projects/${id}`, { signal });
    return data;
}