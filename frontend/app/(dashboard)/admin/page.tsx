"use client";

import { StatsOverview } from "@/modules/admin/overview/components/StatsOverview";
import { PageHeader } from "@/modules/shared/components/PageHeader";

export default function AdminOverviewPage() {
    return (
        <>
            <PageHeader
                title="Platform Overview"
                subtitle="Live metrics, trends, and items that need your attention."
            />
            <div className="mt-8">
                <StatsOverview />
            </div>
        </>
    );
}