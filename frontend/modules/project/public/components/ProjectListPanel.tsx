"use client";

import { useEffect } from "react";
import { Briefcase } from "lucide-react";

import { ProjectListItem } from "./ProjectListItem";
import { Button } from "@/modules/shared/components/button";
import type { ProjectFilters } from "../types/project.public";
import { useProjects } from "../hooks/useProjects";
import { SmartPagination } from "@/modules/shared/components/Pagination";

const SKELETON_COUNT = 6;

interface ProjectListPanelProps {
    selectedId: string;
    onSelect: (id: string) => void;
    onAutoSelect?: (id: string) => void;
    filters: ProjectFilters;
    onPageChange: (page: number) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
}

function ProjectListSkeleton() {
    return (
        <div className="flex flex-col animate-pulse">
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <div key={i} className="px-6 py-5 space-y-4 border-b border-border/40">
                    <div className="flex justify-between items-start gap-4">
                        <div className="h-5 w-3/4 bg-muted/60 rounded-sm" />
                        <div className="h-5 w-20 bg-muted/60 rounded-sm shrink-0" />
                    </div>
                    <div className="flex gap-2">
                        <div className="h-6 w-24 bg-muted/40 rounded-none" />
                        <div className="h-6 w-16 bg-muted/40 rounded-none" />
                    </div>
                    <div className="flex justify-between pt-1">
                        <div className="h-3 w-32 bg-muted/30 rounded-sm" />
                        <div className="h-3 w-16 bg-muted/30 rounded-sm" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function ProjectListPanel({
    selectedId,
    onSelect,
    onAutoSelect,
    filters,
    onPageChange,
    hasActiveFilters,
    onClearFilters,
}: ProjectListPanelProps) {
    const { data, isLoading, error } = useProjects(filters);

    const projects = data?.content ?? [];
    const totalPages = data?.totalPages ?? 0;
    const totalElements = data?.totalElements ?? 0;

    useEffect(() => {
        if (projects.length > 0 && !selectedId) {
            const autoSelectFn = onAutoSelect ?? onSelect;
            autoSelectFn(projects[0].id);
        }
    }, [projects, selectedId, onSelect, onAutoSelect]);

    if (error) {
        return (
            <div className="flex flex-col flex-1 items-center justify-center gap-5 p-8 text-center animate-in fade-in duration-500">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                    <span className="text-xl font-display text-destructive font-bold">!</span>
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-display font-medium text-foreground">Data disruption</p>
                    <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Unable to retrieve index</p>
                </div>
                <Button variant="outline" size="sm" onClick={onClearFilters} className="rounded-none font-mono uppercase text-[10px] tracking-wider mt-2">
                    Reset Coordinates
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full min-h-0 bg-background/40">
            {/* ── Internal Minimal List Header ─────────────────────────────── */}
            <div className="px-6 py-4 border-b border-border/80 shrink-0 flex items-end justify-between bg-card/20 backdrop-blur-sm z-10">
                <span className="font-display text-sm font-bold text-foreground uppercase tracking-wider">
                    Index
                </span>
                {!isLoading && (
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground tabular-nums">
                        [ {totalElements.toLocaleString()} entries ]
                    </span>
                )}
            </div>

            {/* ── Project list ─────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto min-h-0 scrollbar-none">
                {isLoading ? (
                    <ProjectListSkeleton />
                ) : projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[15rem] p-6 text-center animate-in fade-in">
                        <Briefcase className="w-8 h-8 text-muted-foreground/30 mb-4" strokeWidth={1} />
                        <h3 className="font-display text-lg font-semibold text-foreground mb-1">Void</h3>
                        <p className="text-sm text-muted-foreground max-w-[200px] mb-6">
                            {hasActiveFilters ? "Parameters yielded zero results." : "The directory is currently empty."}
                        </p>
                        {hasActiveFilters && (
                            <Button variant="outline" size="sm" onClick={onClearFilters} className="rounded-none font-mono text-[11px] uppercase tracking-wider">
                                Clear Parameters
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-border/40">
                        {projects.map((project, index) => (
                            <div 
                                key={project.id} 
                                className="animate-in fade-in slide-in-from-bottom-2 fill-mode-backwards"
                                style={{ animationDelay: `${index * 50}ms`, animationDuration: '400ms' }}
                            >
                                <ProjectListItem
                                    project={project}
                                    isSelected={project.id === selectedId}
                                    onSelect={onSelect}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Pagination ───────────────────────────────────────────────── */}
            {totalPages > 1 && (
                <div className="shrink-0 border-t border-border/80 py-3 px-4 bg-background z-10">
                    <SmartPagination
                        page={filters.page || 0}
                        totalPages={totalPages}
                        onPageChange={onPageChange}
                    />
                </div>
            )}
        </div>
    );
}