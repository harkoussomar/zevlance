"use client";

import { useState } from "react";
import { AuditLogTable } from "@/modules/admin/audit-log/components/AuditLogTable";
import { PageHeader } from "@/modules/shared/components/PageHeader";

export default function AdminAuditLogPage() {
    const [page, setPage] = useState(0);

    return (
        <>
            <PageHeader
                title="Audit Log"
                subtitle="Immutable system-wide event trace."
            />

            <div className="mt-8">
                <AuditLogTable page={page} onPageChange={setPage} />
            </div>
        </>
    );
}
