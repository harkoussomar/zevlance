"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AdminFilters } from "@/modules/admin/shared/components/AdminFilters";
import { UserTable } from "@/modules/admin/users/components/UserTable";
import { PageHeader } from "@/modules/shared/components/PageHeader";

function AdminUsersContent() {
    const searchParams = useSearchParams();
    const [page, setPage] = useState(0);
    const [roleFilter, setRoleFilter] = useState(searchParams.get("role") ?? "");
    const [statusFilter, setStatusFilter] = useState(searchParams.get("status") ?? "");
    const [search, setSearch] = useState(searchParams.get("search") ?? "");

    function handleFilterChange(key: string, val: string) {
        if (key === "role") setRoleFilter(val);
        if (key === "status") setStatusFilter(val);
        setPage(0);
    }

    function handleSearchChange(val: string) {
        setSearch(val);
        setPage(0);
    }

    return (
        <>
            <PageHeader
                title="User management"
                subtitle="View and moderate all users across the FreelanceHub network."
            />
            <div className="mt-8">
                <AdminFilters
                    showRoleFilter
                    showStatusFilter
                    initialSearch={search}
                    filterValues={{
                        role: roleFilter || undefined,
                        status: statusFilter || undefined,
                    }}
                    placeholder="Search by email…"
                    onSearchChange={handleSearchChange}
                    onFilterChange={handleFilterChange}
                />
                <UserTable
                    page={page}
                    roleFilter={roleFilter || undefined}
                    statusFilter={statusFilter || undefined}
                    search={search || undefined}
                    onPageChange={setPage}
                />
            </div>
        </>
    );
}

export default function AdminUsersPage() {
    return (
        <Suspense>
            <AdminUsersContent />
        </Suspense>
    );
}
