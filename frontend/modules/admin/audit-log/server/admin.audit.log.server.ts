import { serverFetch } from "@/modules/shared/lib/bff/server-fetch";
import { AdminAuditLog } from "@/modules/admin/audit-log/types/admin.audit.log.types";
import { PaginatedResponse } from "@/modules/shared/types";

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

export function getAuditLogServer(
    page: number = 0,
): Promise<PaginatedResponse<AdminAuditLog>> {
    const qs = buildQs({ page, size: 20 });
    return serverFetch<PaginatedResponse<AdminAuditLog>>(
        `/admin/audit-log?${qs}`,
    );
}
