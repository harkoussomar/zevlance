import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { PaginatedResponse, ProjectFilters, ProjectResponse, ProjectSummaryResponse } from "@/types";

export function useProjects(filters: ProjectFilters) {
    return useQuery({
        queryKey: ["projects", filters],
        queryFn: () =>
            api
                .get<PaginatedResponse<ProjectSummaryResponse>>("/projects", {
                    params: filters,
                })
                .then((r) => r.data),


    });
}

export function useProject(id: string) {

    return useQuery({
        queryKey: ["project", id],
        queryFn: () => api.get<ProjectResponse>(`/projects/${id}`).then((r) => r.data),
        enabled: !!id,
    });
}