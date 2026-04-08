import Link from "next/link";
import { Clock, GitBranch } from "lucide-react";
import { Card, CardContent } from "@/modules/shared/components/card";
import { ProjectStatusBadge } from "@/modules/shared/components/status-badge";
import { EmptyState } from "@/modules/shared/components/empty-state";
import { FolderOpen } from "lucide-react";
import type { DashboardProjectItem } from "../types";
import { formatDate } from "@/modules/shared";

interface Props {
    projects: DashboardProjectItem[];
}

export function ClientProjectsList({ projects }: Props) {
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
        <div className="space-y-4">
            {projects.map((project) => (
                <Card key={project.id} className="hover:border-primary/30 hover:shadow-md transition-all duration-200">
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                                <Link
                                    href={`/client/projects/${project.id}`}
                                    className="font-bold text-foreground hover:text-primary transition-colors line-clamp-1 block"
                                >
                                    {project.title}
                                </Link>
                                <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <GitBranch className="w-3 h-3" />
                                        {project.bidCount} {project.bidCount === 1 ? "bid" : "bids"}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        Due {formatDate(project.deadline)}
                                    </span>
                                </div>
                                {project.requiredSkills.length > 0 && (
                                    <div className="flex gap-1.5 mt-2 flex-wrap">
                                        {project.requiredSkills.slice(0, 3).map((skill) => (
                                            <span key={skill} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                                {skill}
                                            </span>
                                        ))}
                                        {project.requiredSkills.length > 3 && (
                                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                                +{project.requiredSkills.length - 3}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="text-right shrink-0 space-y-1">
                                <p className="text-sm font-bold text-foreground tabular-nums">
                                    ${(project.budgetMin / 1000).toFixed(0)}K–${(project.budgetMax / 1000).toFixed(0)}K
                                </p>
                                <ProjectStatusBadge status={project.status} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}