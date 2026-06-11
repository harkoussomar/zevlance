"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { UserDetailView } from "@/modules/admin/users/components/UserDetailView";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { ArrowLeft } from "lucide-react";

export default function AdminUserDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();

    return (
        <>
            <button
                onClick={() => router.back()}
                className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="size-3.5" />
                Back to users
            </button>
            <PageHeader
                title="User detail"
                subtitle="Full profile, verification status and account activity."
            />
            <div className="mt-8">
                <UserDetailView userId={id} />
            </div>
        </>
    );
}
