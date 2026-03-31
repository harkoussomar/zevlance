"use client";

import { CategoryBadge, ProjectStatusBadge } from "@/components/shared/status-badge";
import { SkillTag } from "@/components/ui";
import { formatBudget, formatRelative, cn } from "@/lib/utils";
import { Clock, Users } from "lucide-react";
import { ProjectSummaryResponse } from "@/types";

interface ProjectListItemProps {
    project: ProjectSummaryResponse;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

export function ProjectListItem({ project, isSelected, onSelect }: ProjectListItemProps) {
    return (
        <button
            onClick={() => onSelect(project.id)}
            className={cn(
                "w-full text-left px-4 py-3.5 border-b border-border/60 transition-all duration-150",
                "hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                isSelected
                    ? "bg-primary/8 border-l-2 border-l-primary pl-3.5"
                    : "border-l-2 border-l-transparent",
            )}
        >
            <div className="flex gap-1.5 flex-wrap mb-2">
                <CategoryBadge category={project.category} />
                <ProjectStatusBadge status={project.status} />
            </div>

            <p
                className={cn(
                    "text-sm font-semibold leading-snug line-clamp-2 mb-2 transition-colors",
                    isSelected ? "text-primary" : "text-foreground",
                )}
            >
                {project.title}
            </p>

            <div className="flex gap-1 flex-wrap mb-2.5">
                {project.requiredSkills?.slice(0, 3).map((skill) => (
                    <SkillTag key={skill} skill={skill} />
                ))}
                {(project.requiredSkills?.length ?? 0) > 3 && (
                    <span className="text-[10px] text-muted-foreground font-medium self-center">
                        +{(project.requiredSkills?.length ?? 0) - 3}
                    </span>
                )}
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">
                    {formatBudget(project.budgetMin, project.budgetMax)}
                </span>
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {project.bidCount}
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatRelative(project.createdAt ?? "")}
                    </span>
                </div>
            </div>
        </button>
    );
}