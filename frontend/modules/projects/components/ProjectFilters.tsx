import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/modules/shared/components/button";
import { Card, CardContent } from "@/modules/shared/components/card";
import { Input } from "@/modules/shared/components/input";
import { Select } from "@/modules/shared/components/select";
import { CATEGORY_OPTIONS, STATUS_OPTIONS } from "@/modules/shared";
import { ProjectCategory, ProjectStatus } from "../types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProjectFilterProps {
    search: string;
    setSearch: (value: string) => void;
    category: string;
    setCategory: (value: ProjectCategory | "") => void;
    status: string;
    setStatus: (value: ProjectStatus | "") => void;
    budgetMin: string;
    setBudgetMin: (value: string) => void;
    budgetMax: string;
    setBudgetMax: (value: string) => void;
    setPage: (value: number) => void;
    hasActiveFilters: boolean;
    clearFilters: () => void;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface FilterChipProps {
    label: string;
    onRemove: () => void;
}

function FilterChip({ label, onRemove }: FilterChipProps) {
    return (
        <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1.5 text-xs font-medium bg-primary/8 text-primary border border-primary/20 px-2.5 py-1 rounded-full transition-colors hover:bg-primary/15 hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
            {label}
            <X className="w-3 h-3 opacity-60" />
        </button>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProjectFilter({
    search,
    setSearch,
    category,
    setCategory,
    status,
    setStatus,
    budgetMin,
    setBudgetMin,
    budgetMax,
    setBudgetMax,
    setPage,
    hasActiveFilters,
    clearFilters,
}: ProjectFilterProps) {
    const [showFilters, setShowFilters] = useState(false);

    const activeCount = [category, status, budgetMin || budgetMax].filter(Boolean).length;

    // ── Helpers ───────────────────────────────────────────────────────────────

    const resetPageAndSet =
        <T,>(setter: (value: T) => void) =>
        (value: T) => {
            setter(value);
            setPage(0);
        };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(0);
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
        resetPageAndSet(setCategory)(e.target.value as ProjectCategory | "");

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
        resetPageAndSet(setStatus)(e.target.value as ProjectStatus | "");

    const handleBudgetMinChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        resetPageAndSet(setBudgetMin)(e.target.value);

    const handleBudgetMaxChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        resetPageAndSet(setBudgetMax)(e.target.value);

    const removeBudget = () => {
        setBudgetMin("");
        setBudgetMax("");
        setPage(0);
    };

    const categoryLabel = CATEGORY_OPTIONS.find((o) => o.value === category)?.label;
    const statusLabel = STATUS_OPTIONS.find((o) => o.value === status)?.label;
    const budgetLabel =
        budgetMin || budgetMax
            ? `$${budgetMin || "0"} – $${budgetMax || "∞"}`
            : null;

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-3">
            {/* ── Search + filter toggle ─────────────────────────────────── */}
            <div className="flex gap-2">
                <div className="flex-1">
                    <Input
                        placeholder="Search projects or skills…"
                        startIcon={<Search className="w-4 h-4" />}
                        value={search}
                        onChange={handleSearchChange}
                        aria-label="Search projects"
                    />
                </div>

                <Button
                    variant={showFilters ? "default" : "outline"}
                    size="md"
                    onClick={() => setShowFilters((prev) => !prev)}
                    aria-expanded={showFilters}
                    aria-controls="project-filters-panel"
                    className="shrink-0 gap-1.5"
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="hidden sm:inline">Filters</span>
                    {activeCount > 0 && (
                        <span className="ml-0.5 text-[10px] font-bold bg-primary-foreground text-primary px-1.5 py-0.5 rounded-full leading-none">
                            {activeCount}
                        </span>
                    )}
                </Button>
            </div>

            {/* ── Active filter chips (always visible when filters set) ──── */}
            {hasActiveFilters && !showFilters && (
                <div className="flex items-center gap-1.5 flex-wrap">
                    {categoryLabel && (
                        <FilterChip
                            label={categoryLabel}
                            onRemove={() => { setCategory(""); setPage(0); }}
                        />
                    )}
                    {statusLabel && (
                        <FilterChip
                            label={statusLabel}
                            onRemove={() => { setStatus(""); setPage(0); }}
                        />
                    )}
                    {budgetLabel && (
                        <FilterChip label={budgetLabel} onRemove={removeBudget} />
                    )}
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-0.5 underline underline-offset-2"
                    >
                        Clear all
                    </button>
                </div>
            )}

            {/* ── Expanded filter panel ──────────────────────────────────── */}
            {showFilters && (
                <Card id="project-filters-panel" className="border-border/80">
                    <CardContent className="p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            {/* Category */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                    Category
                                </label>
                                <Select
                                    value={category}
                                    onChange={handleCategoryChange}
                                    placeholder="All Categories"
                                    options={CATEGORY_OPTIONS}
                                />
                            </div>

                            {/* Status */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                    Status
                                </label>
                                <Select
                                    value={status}
                                    onChange={handleStatusChange}
                                    placeholder="All Statuses"
                                    options={STATUS_OPTIONS}
                                />
                            </div>

                            {/* Budget Min */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                    Min Budget ($)
                                </label>
                                <Input
                                    type="number"
                                    placeholder="e.g. 500"
                                    value={budgetMin}
                                    onChange={handleBudgetMinChange}
                                    min={0}
                                    aria-label="Minimum budget"
                                />
                            </div>

                            {/* Budget Max */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                    Max Budget ($)
                                </label>
                                <Input
                                    type="number"
                                    placeholder="e.g. 5,000"
                                    value={budgetMax}
                                    onChange={handleBudgetMaxChange}
                                    min={0}
                                    aria-label="Maximum budget"
                                />
                            </div>
                        </div>

                        {/* Active chips + clear all inside the panel */}
                        {hasActiveFilters && (
                            <div className="flex items-center gap-2 pt-3 border-t border-border flex-wrap">
                                <span className="text-[11px] font-medium text-muted-foreground shrink-0">
                                    Active:
                                </span>

                                {categoryLabel && (
                                    <FilterChip
                                        label={categoryLabel}
                                        onRemove={() => { setCategory(""); setPage(0); }}
                                    />
                                )}
                                {statusLabel && (
                                    <FilterChip
                                        label={statusLabel}
                                        onRemove={() => { setStatus(""); setPage(0); }}
                                    />
                                )}
                                {budgetLabel && (
                                    <FilterChip label={budgetLabel} onRemove={removeBudget} />
                                )}

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="ml-auto text-xs text-muted-foreground h-7"
                                >
                                    Clear all
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}