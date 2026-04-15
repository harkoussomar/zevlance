"use client";

import { cn, formatBudget, formatRelative } from "@/modules/shared";
import {
    CategoryBadge,
    ProjectStatusBadge,
} from "@/modules/shared/components/status-badge";
import { Users } from "lucide-react";
import type { ProjectSummaryResponse } from "../../shared/types/project.shared";

interface ProjectListItemProps {
    project: ProjectSummaryResponse;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

const MAX_VISIBLE_SKILLS = 2;

export function ProjectListItem({
    project,
    isSelected,
    onSelect,
}: ProjectListItemProps) {
    const skills = project.requiredSkills ?? [];
    const visibleSkills = skills.slice(0, MAX_VISIBLE_SKILLS);
    const overflowCount = skills.length - MAX_VISIBLE_SKILLS;

    return (
        <button
            type="button"
            onClick={() => onSelect(project.id)}
            aria-pressed={isSelected}
            aria-label={`View project: ${project.title}`}
            className={cn(
                "group w-full text-left relative",
                "px-4 py-3.5",
                "border-l-2 transition-all duration-150 ease-out",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring",
                isSelected
                    ? "border-l-primary bg-primary/5"
                    : "border-l-transparent hover:bg-muted/30 hover:border-l-border",
            )}
        >
            {/* Top row: budget dominant + meta */}
            <div className="flex items-baseline justify-between gap-2 mb-1.5">
                <span
                    className={cn(
                        "font-mono text-sm font-semibold tabular-nums tracking-tight transition-colors duration-150",
                        isSelected ? "text-primary" : "text-foreground",
                    )}
                >
                    {formatBudget(project.budgetMin, project.budgetMax)}
                </span>

                <div className="flex items-center gap-2 shrink-0">
                    <span className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground tabular-nums">
                        <Users className="w-2.5 h-2.5" />
                        {project.bidCount}
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground/50 tabular-nums">
                        {formatRelative(project.createdAt ?? "")}
                    </span>
                </div>
            </div>

            {/* Title */}
            <p
                className={cn(
                    "text-[13px] leading-snug line-clamp-2 mb-2.5 transition-colors duration-150",
                    isSelected
                        ? "text-foreground font-medium"
                        : "text-foreground/75 font-normal group-hover:text-foreground",
                )}
            >
                {project.title}
            </p>

            {/* Badge + skills row */}
            <div className="flex items-center gap-1.5 flex-wrap">
                <CategoryBadge category={project.category} />
                <ProjectStatusBadge status={project.status} />

                {visibleSkills.length > 0 && (
                    <>
                        <span className="text-border text-[10px] select-none">·</span>
                        {visibleSkills.map((skill) => (
                            <span
                                key={skill}
                                className="font-mono text-[10px] text-muted-foreground/60 px-1.5 py-px rounded-sm bg-muted/40 border border-border/30"
                            >
                                {skill}
                            </span>
                        ))}
                        {overflowCount > 0 && (
                            <span className="font-mono text-[10px] text-muted-foreground/40">
                                +{overflowCount}
                            </span>
                        )}
                    </>
                )}
            </div>
        </button>
    );
}