"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AdminFilters } from "@/modules/admin/shared/components/AdminFilters";
import { ProjectTable } from "@/modules/admin/projects/components/ProjectTable";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import type { AdminProjectFilter } from "@/modules/admin/projects/types/admin.projects.types";
import { CATEGORY_LABELS, PROJECT_STATUSES } from "@/modules/admin/projects/types/admin.projects.types";

function AdminProjectsContent() {
    const searchParams = useSearchParams();
    const [page, setPage] = useState(0);
    const [filters, setFilters] = useState<AdminProjectFilter>(() => ({
        status: searchParams.get("status") || undefined,
        category: searchParams.get("category") || undefined,
        flagged: toOptionalBoolean(searchParams.get("flagged")),
        featured: toOptionalBoolean(searchParams.get("featured")),
        search: searchParams.get("search") || undefined,
    }));

    function handleFilterChange(key: string, val: string) {
        setFilters((prev) => ({
            ...prev,
            // Convert the special boolean filters coming from select elements
            [key]:
                key === "flagged" || key === "featured"
                    ? val === "" ? undefined : val === "true"
                    : val === "" ? undefined : val,
        }));
        setPage(0);
    }

    return (
        <>
            <PageHeader
                title="Project Management"
                subtitle="Monitor, evaluate, and moderate project postings."
            />

            <div className="mt-8 space-y-4">
                <AdminFilters
                    showStatusFilter
                    initialSearch={filters.search ?? ""}
                    filterValues={{
                        status: filters.status,
                        category: filters.category,
                        flagged: filters.flagged === undefined ? undefined : String(filters.flagged),
                        featured: filters.featured === undefined ? undefined : String(filters.featured),
                    }}
                    statusOptions={PROJECT_STATUSES.map((s) => ({ value: s, label: s.replace("_", " ") }))}
                   
                    extraFilters={[
                        {
                            key: "category",
                            placeholder: "All categories",
                            options: Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
                                value,
                                label,
                            })),
                        },
                        {
                            key: "flagged",
                            placeholder: "Flagged?",
                            options: [
                                { value: "true", label: "Flagged only" },
                                { value: "false", label: "Not flagged" },
                            ],
                        },
                        {
                            key: "featured",
                            placeholder: "Featured?",
                            options: [
                                { value: "true", label: "Featured only" },
                                { value: "false", label: "Not featured" },
                            ],
                        },
                    ]}
                    onSearchChange={(val) => handleFilterChange("search", val)}
                    onFilterChange={handleFilterChange}
                    placeholder="Search by title…"
                />

                <ProjectTable
                    page={page}
                    filters={filters}
                    onPageChange={setPage}
                />
            </div>
        </>
    );
}

export default function AdminProjectsPage() {
    return (
        <Suspense>
            <AdminProjectsContent />
        </Suspense>
    );
}

function toOptionalBoolean(value: string | null): boolean | undefined {
    if (value === "true") return true;
    if (value === "false") return false;
    return undefined;
}
