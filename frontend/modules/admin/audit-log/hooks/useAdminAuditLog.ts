import { useQuery } from "@tanstack/react-query";
import { adminKeys } from "../../shared/hooks/admin.keys";
import { adminAuditLogApi } from "../api/admin.audit.log.api";

export function useAdminAuditLog(page: number) {
    return useQuery({
        queryKey: adminKeys.auditLog(page),
        queryFn: ({ signal }) => adminAuditLogApi.getAuditLog(page, signal),
    });
}
