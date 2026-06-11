import {
    AdminAuditLog,
    AdminAuditLogSchema,
} from "@/modules/admin/audit-log/types/admin.audit.log.types";
import api from "../../../shared/lib/axios";
import { PaginatedResponse, PaginatedResponseSchema } from "@/modules/shared/types";

function buildQs(
    params: Record<string, string | number | undefined | null>,
): string {
    const qs = new URLSearchParams();
    for (const [key, val] of Object.entries(params)) {
        if (val !== undefined && val !== null && val !== "") {
            qs.set(key, String(val));
        }
    }
    return qs.toString();
}

export const adminAuditLogApi = {
    getAuditLog: (
        page: number = 0,
        signal?: AbortSignal,
    ): Promise<PaginatedResponse<AdminAuditLog>> => {
        const qs = buildQs({ page, size: 20 });
        return api
            .get<
                PaginatedResponse<AdminAuditLog>
            >(`/admin/audit-log?${qs}`, { signal })
            .then((r) =>
                PaginatedResponseSchema(AdminAuditLogSchema).parse(r.data),
            );
    },
};
