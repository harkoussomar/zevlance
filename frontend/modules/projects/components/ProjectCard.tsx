import { CategoryBadge, ProjectStatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, SkillTag } from "@/components/ui";
import { MOCK_PROJECTS } from "@/lib/mock-data";
import { formatDate, formatRelative } from "@/lib/utils";
import { ArrowRight, Clock, DollarSign, Users } from "lucide-react";
import Link from "next/link";

export function ProjectCard({ project }: { project: (typeof MOCK_PROJECTS)[0] }) {
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
                        {project.requiredSkills.slice(0, 4).map((skill) => (
                            <SkillTag key={skill} skill={skill} />
                        ))}
                        {project.requiredSkills.length > 4 && (
                            <span className="text-[10px] text-muted-foreground font-medium py-0.5">
                                +{project.requiredSkills.length - 4}
                            </span>
                        )}
                    </div>

                    {/* Meta row */}
                    <div className="border-t border-border pt-4 mt-auto grid grid-cols-3 gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <DollarSign className="w-3 h-3 shrink-0" />
                            <span className="font-semibold text-foreground truncate">
                                ${project.budgetMin / 1000}K–$
                                {project.budgetMax / 1000}K
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="w-3 h-3 shrink-0" />
                            <span>{project.bidCount} bids</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                            <Clock className="w-3 h-3 shrink-0" />
                            <span>{formatDate(project.deadline)}</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                        <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center text-[9px] font-bold text-primary">
                                {project.clientName[0]}
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {project.clientName}
                            </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                            {formatRelative(project.createdAt ?? "")}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}