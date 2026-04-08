import {
    CategoryBadge,
    ProjectStatusBadge,
} from "@/modules/shared/components/status-badge";
import { ArrowRight, Clock, DollarSign, Users } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/modules/shared/components/card";
import { SkillTag } from "@/modules/shared/components/skil-tag";
import { ProjectSummaryResponse } from "../types";
import { formatBudget, formatRelative } from "@/modules/shared";

interface ProjectCardProps {
    project: ProjectSummaryResponse;
}

export function ProjectCard({ project }: ProjectCardProps) {
    return (
        <Link href={`/projects/${project.id}`}>
            <Card className="group h-full flex flex-col hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                <CardContent className="p-5 flex flex-col flex-1">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex gap-1.5 flex-wrap">
                            <CategoryBadge category={project.category} />
                            <ProjectStatusBadge status={project.status} />
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0 mt-0.5" />
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-sm leading-snug mb-2 line-clamp-2">
                        {project.title}
                    </h3>

                    {/* Skills */}
                    <div className="flex gap-1.5 flex-wrap mb-auto pb-4">
                        {project.requiredSkills?.slice(0, 4).map((skill) => (
                            <SkillTag key={skill} skill={skill} />
                        ))}
                        {(project.requiredSkills?.length ?? 0) > 4 && (
                            <span className="text-[10px] text-muted-foreground font-medium py-0.5">
                                +{(project.requiredSkills?.length ?? 0) - 4}
                            </span>
                        )}
                    </div>

                    {/* Meta row */}
                    <div className="border-t border-border pt-4 mt-auto grid grid-cols-3 gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <DollarSign className="w-3 h-3 shrink-0" />
                            <span className="font-semibold text-foreground truncate">
                                {formatBudget(
                                    project.budgetMin,
                                    project.budgetMax,
                                )}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="w-3 h-3 shrink-0" />
                            <span>{project.bidCount} bids</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                            <Clock className="w-3 h-3 shrink-0" />
                            <span>
                                {formatRelative(project.createdAt ?? "")}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
