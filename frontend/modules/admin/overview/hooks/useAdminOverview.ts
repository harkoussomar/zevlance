import { useQuery } from "@tanstack/react-query";
import { adminKeys } from "../../shared/hooks/admin.keys";
import { adminOverviewApi } from "../api/admin.overview.api";
import { adminProjectsApi } from "../../projects/api/admin.projects.api";
import { adminAuditLogApi } from "../../audit-log/api/admin.audit.log.api";

export function useAdminStats() {
    return useQuery({
        queryKey: adminKeys.stats(),
        queryFn: ({ signal }) => adminOverviewApi.getStats(signal),
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Fetches the 5 most recently flagged projects for the overview panel.
 * Re-uses the existing projects list endpoint with flagged=true filter.
 */
export function useAdminFlaggedProjects() {
    return useQuery({
        queryKey: [...adminKeys.all, "projects", "flagged-preview"],
        queryFn: ({ signal }) =>
            adminProjectsApi.getProjects({ page: 0, size: 5, flagged: true }, signal),
        staleTime: 2 * 60 * 1000,
    });
}

/**
 * Fetches the 5 most recent audit log entries for the overview panel.
 * Re-uses the existing audit log endpoint.
 */
export function useAdminRecentAuditLog() {
    return useQuery({
        queryKey: adminKeys.auditLog(0),
        queryFn: ({ signal }) => adminAuditLogApi.getAuditLog(0, signal),
        staleTime: 60 * 1000,
    });
}
