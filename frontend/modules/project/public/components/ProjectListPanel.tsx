"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Briefcase } from "lucide-react";

import { ProjectListItem } from "./ProjectListItem";
import { ProjectFilter } from "./ProjectFilters";
import { Button } from "@/modules/shared/components/button";
import { EmptyState } from "@/modules/shared/components/empty-state";
import type { ProjectCategory } from "../../shared/types/project.shared";
import type { ProjectFilters } from "../types/project.public";
import { useProjects } from "../hooks/useProjects";
import { SmartPagination } from "@/modules/shared/components/Pagination";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;
const SKELETON_COUNT = 6;

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProjectListPanelProps {
    selectedId: string;
    /** User explicitly selected a project (e.g. via click). */
    onSelect: (id: string) => void;
    /**
     * The panel auto-selected a project (e.g. first item on load/filter change).
     * Defaults to `onSelect` when not provided.
     * Separate from `onSelect` so the parent can decide whether to open
     * the detail panel on mobile on auto-selection.
     */
    onAutoSelect?: (id: string) => void;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Animated skeleton rows shown while the project list is loading. */
function ProjectListSkeleton() {
    return (
        <div className="flex flex-col divide-y divide-border/60 animate-pulse">
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <div key={i} className="px-5 py-5 space-y-3">
                    {/* Badge row */}
                    <div className="flex gap-2">
                        <div className="h-5 w-20 bg-muted rounded-full" />
                        <div className="h-5 w-16 bg-muted rounded-full" />
                    </div>
                    {/* Title */}
                    <div className="h-4 bg-muted rounded w-5/6" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                    {/* Skills */}
                    <div className="flex gap-1.5 pt-0.5">
                        <div className="h-5 w-14 bg-muted rounded-full" />
                        <div className="h-5 w-18 bg-muted rounded-full" />
                        <div className="h-5 w-12 bg-muted rounded-full" />
                    </div>
                    {/* Footer */}
                    <div className="flex justify-between pt-0.5">
                        <div className="h-3.5 w-24 bg-muted rounded" />
                        <div className="h-3.5 w-20 bg-muted rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProjectListPanel({
    selectedId,
    onSelect,
    onAutoSelect,
}: ProjectListPanelProps) {
    // ── Filter state ───────────────────────────────────────────────────────────
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState<ProjectCategory | "">("");
    const [budgetMin, setBudgetMin] = useState("");
    const [budgetMax, setBudgetMax] = useState("");
    const [page, setPage] = useState(0);

    const filters: ProjectFilters = useMemo(
        () => ({
            page,
            size: PAGE_SIZE,
            category: category || undefined,
            budgetMin: budgetMin ? Number(budgetMin) : undefined,
            budgetMax: budgetMax ? Number(budgetMax) : undefined,
            query: search || undefined,
        }),
        [page, category, budgetMin, budgetMax, search],
    );

const hasActiveFilters = useMemo(
    () => [category, budgetMin, budgetMax, search].some(Boolean),
    [category, budgetMin, budgetMax, search],
);

    // ── Data fetching ──────────────────────────────────────────────────────────
    const { data, isLoading, error } = useProjects(filters);

    const projects = data?.content ?? [];
    const totalPages = data?.totalPages ?? 0;
    const totalElements = data?.totalElements ?? 0;

    // ── Side-effects ───────────────────────────────────────────────────────────

    /**
     * Auto-select the first project whenever the list refreshes and nothing is
     * selected (e.g. initial load, filter change clears current selection).
     */
    useEffect(() => {
        if (projects.length > 0 && !selectedId) {
            const autoSelectFn = onAutoSelect ?? onSelect;
            autoSelectFn(projects[0].id);
        }
    }, [projects, selectedId, onSelect, onAutoSelect]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const clearFilters = useCallback(() => {
        setCategory("");
        setBudgetMin("");
        setBudgetMax("");
        setSearch("");
        setPage(0);
    }, []);

    // ── Error state ────────────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="flex flex-col flex-1 items-center justify-center gap-4 p-8 text-center">
                <p className="text-sm font-medium text-destructive">
                    Failed to load projects.
                </p>
                <p className="text-xs text-muted-foreground">
                    Check your connection and try again.
                </p>
                <Button variant="outline" size="sm" onClick={clearFilters}>
                    Reset & retry
                </Button>
            </div>
        );
    }

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col h-full min-h-0">
            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="px-5 py-4 border-b border-border shrink-0 space-y-4">
                <div className="flex items-baseline justify-between gap-2">
                    <h2 className="text-base font-bold text-foreground tracking-tight">
                        Browse Projects
                    </h2>
                    {!isLoading && (
                        <span className="text-xs font-medium text-muted-foreground tabular-nums">
                            {totalElements.toLocaleString()}{" "}
                            {totalElements === 1 ? "result" : "results"}
                        </span>
                    )}
                </div>

                <ProjectFilter
                    search={search}
                    setSearch={setSearch}
                    category={category}
                    setCategory={setCategory}
                    budgetMin={budgetMin}
                    setBudgetMin={setBudgetMin}
                    budgetMax={budgetMax}
                    setBudgetMax={setBudgetMax}
                    setPage={setPage}
                    hasActiveFilters={hasActiveFilters}
                    clearFilters={clearFilters}
                />
            </div>

            {/* ── Project list ─────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto min-h-0">
                {isLoading ? (
                    <ProjectListSkeleton />
                ) : projects.length === 0 ? (
                    <div className="flex items-center justify-center h-full min-h-60 p-6">
                        <EmptyState
                            icon={<Briefcase className="w-5 h-5" />}
                            title="No projects found"
                            description={
                                hasActiveFilters
                                    ? "No projects match your current filters."
                                    : "There are no projects available right now."
                            }
                            action={
                                hasActiveFilters ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={clearFilters}
                                    >
                                        Clear filters
                                    </Button>
                                ) : undefined
                            }
                        />
                    </div>
                ) : (
                    <div className="divide-y divide-border/60">
                        {projects.map((project) => (
                            <ProjectListItem
                                key={project.id}
                                project={project}
                                isSelected={project.id === selectedId}
                                onSelect={onSelect}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Pagination ───────────────────────────────────────────────── */}
            {totalPages > 1 && (
                <div className="shrink-0 border-t border-border py-2.5 px-3">
                    <SmartPagination
                        page={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                    />
                </div>
            )}
        </div>
    );
}
