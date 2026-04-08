"use client";

import { Clock, Users } from "lucide-react";

import { cn, formatBudget, formatRelative } from "@/modules/shared";
import {
    CategoryBadge,
    ProjectStatusBadge,
} from "@/modules/shared/components/status-badge";
import { SkillTag } from "@/modules/shared/components/skil-tag";
import { ProjectSummaryResponse } from "../types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProjectListItemProps {
    project: ProjectSummaryResponse;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Max skill tags to show before showing the "+N more" overflow label. */
const MAX_VISIBLE_SKILLS = 3;

// ─── Component ────────────────────────────────────────────────────────────────

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
            className={cn(
                // Layout & reset
                "w-full text-left px-5 py-5 relative",
                // Interaction
                "transition-colors duration-100",
                "hover:bg-muted/40 active:bg-muted/60",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40",
                // Selected accent — left border stripe
                "border-l-[3px]",
                isSelected
                    ? "bg-primary/5 border-l-primary"
                    : "border-l-transparent",
            )}
            aria-pressed={isSelected}
            aria-label={`View project: ${project.title}`}
        >
            {/* ── Badge row ──────────────────────────────────────────────── */}
            <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                <CategoryBadge category={project.category} />
                <ProjectStatusBadge status={project.status} />
            </div>

            {/* ── Title ──────────────────────────────────────────────────── */}
            <p
                className={cn(
                    "text-sm font-semibold leading-snug line-clamp-2 mb-3 transition-colors",
                    isSelected ? "text-primary" : "text-foreground",
                )}
            >
                {project.title}
            </p>

            {/* ── Skills ─────────────────────────────────────────────────── */}
            {visibleSkills.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap mb-3.5">
                    {visibleSkills.map((skill) => (
                        <SkillTag key={skill} skill={skill} />
                    ))}
                    {overflowCount > 0 && (
                        <span className="text-[10px] font-semibold text-muted-foreground">
                            +{overflowCount}
                        </span>
                    )}
                </div>
            )}

            {/* ── Footer: budget + meta ───────────────────────────────────── */}
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span className="font-bold text-foreground text-[13px]">
                    {formatBudget(project.budgetMin, project.budgetMax)}
                </span>

                <div className="flex items-center gap-3 shrink-0">
                    <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span className="tabular-nums">{project.bidCount}</span>
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