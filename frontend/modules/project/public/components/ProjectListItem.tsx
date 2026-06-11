"use client";

import { cn, formatBudget, formatRelative } from "@/modules/shared";
import { CategoryBadge } from "@/modules/shared/components/status-badge";
import { Users } from "lucide-react";
import type { ProjectSummaryResponse } from "../../shared/types/project.shared";

interface ProjectListItemProps {
    project: ProjectSummaryResponse;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

const MAX_VISIBLE_SKILLS = 2;

export function ProjectListItem({ project, isSelected, onSelect }: ProjectListItemProps) {
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
                "group w-full text-left relative overflow-hidden",
                "px-6 py-5",
                "border-l-[3px] transition-all duration-300 ease-out",
                "focus-visible:outline-none focus-visible:bg-primary/5",
                isSelected
                    ? "border-l-primary bg-primary/[0.03]"
                    : "border-l-transparent hover:bg-foreground/[0.02] hover:border-l-border"
            )}
        >
            {/* Structural grid layout for desktop items */}
            <div className="flex flex-col gap-3">
                
                {/* Header row: Title + Budget */}
                <div className="flex items-start justify-between gap-4">
                    <h3 className={cn(
                        "font-display text-base font-semibold leading-tight line-clamp-2 transition-colors duration-200",
                        isSelected ? "text-primary" : "text-foreground group-hover:text-primary"
                    )}>
                        {project.title}
                    </h3>
                    <div className="shrink-0 text-right mt-0.5">
                        <span className={cn(
                            "font-mono text-sm font-bold tabular-nums tracking-tight block",
                            isSelected ? "text-primary" : "text-foreground/80"
                        )}>
                            {formatBudget(project.budgetMin, project.budgetMax)}
                        </span>
                    </div>
                </div>

                {/* Badges & Meta row */}
                <div className="flex items-center justify-between flex-wrap gap-y-2 mt-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <CategoryBadge category={project.category} />
                        {visibleSkills.length > 0 && (
                            <>
                                <span className="w-px h-3 bg-border/60 mx-0.5 hidden sm:inline-block" />
                                {visibleSkills.map((skill) => (
                                    <span
                                        key={skill}
                                        className="font-mono text-[10px] text-muted-foreground/80 uppercase tracking-widest px-1.5 py-0.5 bg-muted/30 border border-border/40"
                                    >
                                        {skill}
                                    </span>
                                ))}
                                {overflowCount > 0 && (
                                    <span className="font-mono text-[10px] text-muted-foreground/60">
                                        +{overflowCount}
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0 ml-auto">
                        <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
                            <Users className="w-3 h-3" /> {project.bidCount}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50">
                            {formatRelative(project.createdAt ?? "")}
                        </span>
                    </div>
                </div>
            </div>
        </button>
    );
}