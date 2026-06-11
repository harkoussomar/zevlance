import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "../../shared/hooks/admin.keys";
import { adminProjectsApi } from "../api/admin.projects.api";
import type {
    AdminProjectFilter,
    ChangeStatusPayload,
    FeaturePayload,
    FlagPayload,
} from "../types/admin.projects.types";

// ── Queries ────────────────────────────────────────────────────────────────────

export function useAdminProjects(page: number, filters: AdminProjectFilter) {
    return useQuery({
        queryKey: adminKeys.projects(page, filters),
        queryFn: ({ signal }) =>
            adminProjectsApi.getProjects({ ...filters, page }, signal),
    });
}

export function useAdminProjectDetail(id: string) {
  
    return useQuery({
        queryKey: adminKeys.projectDetail(id),
        queryFn: ({ signal }) => adminProjectsApi.getProjectDetail(id, signal),
        enabled: !!id,
    });
}

// ── Mutations ──────────────────────────────────────────────────────────────────

export function useChangeProjectStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: ChangeStatusPayload) =>
            adminProjectsApi.changeProjectStatus(payload),
        onSuccess: (_data, { id }) => {
            queryClient.invalidateQueries({ queryKey: [...adminKeys.all, "projects"] });
            queryClient.invalidateQueries({ queryKey: adminKeys.projectDetail(id) });
            queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
        },
    });
}

export function useFlagProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: FlagPayload) => adminProjectsApi.flagProject(payload),
        onSuccess: (_data, { id }) => {
            queryClient.invalidateQueries({ queryKey: [...adminKeys.all, "projects"] });
            queryClient.invalidateQueries({ queryKey: adminKeys.projectDetail(id) });
        },
    });
}

export function useFeatureProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: FeaturePayload) => adminProjectsApi.featureProject(payload),
        onSuccess: (_data, { id }) => {
            queryClient.invalidateQueries({ queryKey: [...adminKeys.all, "projects"] });
            queryClient.invalidateQueries({ queryKey: adminKeys.projectDetail(id) });
        },
    });
}

export function useDeleteProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) =>
            adminProjectsApi.deleteProject(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...adminKeys.all, "projects"] });
            queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
            queryClient.invalidateQueries({ queryKey: adminKeys.auditLog(0) });
        },
    });
}