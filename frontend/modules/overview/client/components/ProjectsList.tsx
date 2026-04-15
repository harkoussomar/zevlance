import Link from "next/link";
import { Clock, GitBranch, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/modules/shared/components/card";
import { ProjectStatusBadge } from "@/modules/shared/components/status-badge";
import { EmptyState } from "@/modules/shared/components/empty-state";
import { FolderOpen } from "lucide-react";
import { formatDate } from "@/modules/shared";
import type { OverviewProjectItem } from "../types/overview.client";

interface Props {
    projects: OverviewProjectItem[];
}

export function ProjectsList({ projects }: Props) {
    if (projects.length === 0) {
        return (
            <EmptyState
                icon={<FolderOpen className="w-7 h-7" />}
                title="No projects yet"
                description="Create projects to receive proposals from freelancers."
            />
        );
    }

    return (
        <div className="space-y-3">
            {projects.map((project) => (
                <Link
                    key={project.id}
                    href={`/client/projects/${project.id}`}
                    className="block group"
                >
                    <Card className="transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-lg group-hover:-translate-y-0.5 overflow-hidden">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                        <p className="font-bold text-[15px] text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                            {project.title}
                                        </p>
                                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                                    </div>

                                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                                        <span className="flex items-center gap-1 font-medium">
                                            <GitBranch className="w-3 h-3" />
                                            {project.bidCount}{" "}
                                            {project.bidCount === 1
                                                ? "bid"
                                                : "bids"}
                                        </span>
                                        <span className="w-px h-3 bg-border" />
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            Due {formatDate(project.deadline)}
                                        </span>
                                    </div>

                                    {project.requiredSkills.length > 0 && (
                                        <div className="flex gap-1.5 mt-2.5 flex-wrap">
                                            {project.requiredSkills
                                                .slice(0, 3)
                                                .map((skill) => (
                                                    <span
                                                        key={skill}
                                                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/60"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            {project.requiredSkills.length >
                                                3 && (
                                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/60">
                                                    +
                                                    {project.requiredSkills
                                                        .length - 3}{" "}
                                                    more
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="text-right shrink-0 space-y-1.5">
                                    <p className="text-sm font-bold text-foreground tabular-nums">
                                        ${(project.budgetMin / 1000).toFixed(0)}
                                        K–$
                                        {(project.budgetMax / 1000).toFixed(0)}K
                                    </p>
                                    <ProjectStatusBadge
                                        status={project.status}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    );
}
