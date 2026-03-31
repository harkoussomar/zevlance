"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X, Briefcase } from "lucide-react";
import { Button, Input, Select, EmptyState } from "@/components/ui";
import { CATEGORY_OPTIONS, STATUS_OPTIONS } from "@/lib/utils";
import { useProjects } from "@/modules/projects/hooks/useProject";
import type { ProjectCategory, ProjectStatus, ProjectFilters } from "@/types";
import { ProjectListItem } from "./ProjectListItem";
import { Pagination } from "./Pagination";

const PAGE_SIZE = 10; // Updated to match API default

interface ProjectListPanelProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

export function ProjectListPanel({ selectedId, onSelect }: ProjectListPanelProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ProjectCategory | "">("");
  const [status, setStatus] = useState<ProjectStatus | "">("");
  const [budgetMin, setBudgetMin] = useState<number | "">("");
  const [budgetMax, setBudgetMax] = useState<number | "">("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(0);

  // Build API filters - page is 0-indexed for standard backend APIs
  const filters: ProjectFilters = useMemo(
    () => ({
      page, 
      size: PAGE_SIZE,
      category: category || undefined,
      status: status || undefined,
      budgetMin: budgetMin || undefined,
      budgetMax: budgetMax || undefined,
      skill: search || undefined,
      search: search || undefined,
    }),
    [page, category, status, budgetMin, budgetMax, search]
  );

  const { data, isLoading, error } = useProjects(filters);

  const totalPages = data?.totalPages ?? 0;
  const projects = data?.content ?? [];

  // Auto-select the first project if nothing is selected yet
  useEffect(() => {
    if (projects.length > 0 && !selectedId) {
        onSelect(projects[0].id);
    }
  }, [projects, selectedId, onSelect]);

  const activeFilterCount = [category, status, budgetMin, budgetMax, search].filter(Boolean).length;
  const hasActiveFilters = activeFilterCount > 0;

  const clearFilters = () => {
    setCategory("");
    setStatus("");
    setBudgetMin("");
    setBudgetMax("");
    setSearch("");
    setPage(0);
  };

  if (error) {
    return <div className="p-4 text-sm text-destructive">Failed to load projects.</div>;
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-foreground">Browse Projects</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {data?.totalElements ?? 0} results
            </p>
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters((s) => !s)}
            className="h-8 px-2.5 text-xs gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
            {hasActiveFilters && (
              <span className="text-[10px] font-bold bg-primary-foreground text-primary px-1.5 py-0.5 rounded-full leading-none">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        <Input
          placeholder="Search projects or skills…"
          startIcon={<Search className="w-3.5 h-3.5" />}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="h-8 text-sm"
        />
      </div>

      {/* Expandable filters - kept identical to your code */}
      {showFilters && (
        <div className="px-4 py-3 border-b border-border bg-muted/30 shrink-0 space-y-2.5">
            {/* ... Your existing filter UI code here ... */}
        </div>
      )}

      {/* Project list */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {isLoading ? (
          <div className="p-6 text-sm text-muted-foreground flex items-center justify-center">
             Loading projects…
          </div>
        ) : projects.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={<Briefcase className="w-5 h-5" />}
              title="No projects found"
              description="Try adjusting your filters."
              action={<Button variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button>}
            />
          </div>
        ) : (
          projects.map((project) => (
            <ProjectListItem
              key={project.id}
              project={project}
              isSelected={project.id === selectedId}
              onSelect={onSelect}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="shrink-0 border-t border-border py-2 px-2">
          <Pagination page={page} totalPages={totalPages} setPage={setPage} />
        </div>
      )}
    </div>
  );
}