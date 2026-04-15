// app/(dashboard)/client/projects/[id]/edit/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";

import { SkeletonCard } from "@/modules/shared/components/skeleton";
import { Alert } from "@/modules/shared/components/alert";
import { useProject } from "@/modules/project/public/hooks/useProject";
import { ProjectFormValues } from "@/modules/project/client/schema/create.project.schema";
import { ProjectCategory } from "@/modules/project/shared/types/project.shared";
import { ProjectForm } from "@/modules/project/client";


// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EditProjectPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const { data: project, isLoading, error } = useProject(id);

    if (isLoading) return <SkeletonCard />;

    if (error || !project) {
        return (
            <div className="space-y-4">
                <Link
                    href="/my-projects"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    My Projects
                </Link>
                <Alert variant="destructive">
                    <AlertCircle className="w-4 h-4" />
                    {error
                        ? "Failed to load project. Please try again."
                        : "Project not found."}
                </Alert>
            </div>
        );
    }

    // Only OPEN projects are editable
    if (project.status !== "OPEN") {
        return (
            <div className="space-y-4">
                <Link
                    href="/my-projects"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    My Projects
                </Link>
                <Alert>
                    <AlertCircle className="w-4 h-4" />
                    Only <strong>OPEN</strong> projects can be edited. This
                    project is <strong>{project.status}</strong>.
                </Alert>
            </div>
        );
    }

    // Map ProjectResponse → form default values
    const defaultValues: Partial<ProjectFormValues> = {
        title: project.title,
        description: project.description,
        category: project.category as ProjectCategory,
        budgetMin: project.budgetMin,
        budgetMax: project.budgetMax,
        deadline: project.deadline,
        requiredSkills: project.requiredSkills ?? [],
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Link
                    href="/client/projects"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    My Projects
                </Link>
                <h1 className="text-2xl font-bold text-foreground">
                    Edit Project
                </h1>
                <p className="text-muted-foreground mt-1 line-clamp-1">
                    {project.title}
                </p>
            </div>

            <ProjectForm
                mode="edit"
                projectId={id}
                defaultValues={defaultValues}
                onSuccess={() => router.push("/client/projects")}
            />
        </div>
    );
}
