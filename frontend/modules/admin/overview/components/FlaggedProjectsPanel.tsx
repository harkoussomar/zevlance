"use client";

import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { Card } from "@/modules/shared/components/card";
import { useAdminFlaggedProjects } from "../hooks/useAdminOverview";

export function FlaggedProjectsPanel() {
    const router = useRouter();
    const { data, isLoading } = useAdminFlaggedProjects();

    const items = data?.content ?? [];

    return (
        <Card className="p-0 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-2.5">
                    <div className="size-7 rounded-lg bg-destructive/10 flex items-center justify-center">
                        <ShieldAlert className="size-3.5 text-destructive" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-foreground leading-tight">
                            Flagged projects
                        </h3>
                        <p className="text-[11px] text-muted-foreground">Needs review</p>
                    </div>
                </div>
                <button
                    onClick={() => router.push("/admin/projects?flagged=true")}
                    className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                >
                    View all <ArrowRight className="size-3" />
                </button>
            </div>

            {/* Body */}
            <div className="divide-y divide-border">
                {isLoading ? (
                    <div className="py-10 flex justify-center">
                        <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="py-10 flex flex-col items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="size-5 text-success opacity-70" />
                        <p className="text-xs">No flagged projects</p>
                    </div>
                ) : (
                    items.map((project) => (
                        <button
                            key={project.id}
                            onClick={() => router.push(`/admin/projects/${project.id}`)}
                            className="w-full px-5 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-muted/40 transition-colors group"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-foreground truncate leading-snug">
                                    {project.title}
                                </p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                    {project.clientName ?? "Unknown client"} · {project.bidCount} bids
                                </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20 uppercase tracking-wide">
                                    {project.status}
                                </span>
                                <ArrowRight className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </button>
                    ))
                )}
            </div>
        </Card>
    );
}