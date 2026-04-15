"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/modules/shared";
import { Button } from "@/modules/shared/components/button";
import { InputField } from "@/modules/shared/components/input";
import { Select } from "@/modules/shared/components/select";
import { CATEGORY_OPTIONS } from "@/modules/shared";
import type { ProjectCategory } from "../../shared/types/project.shared";

interface ProjectFilterProps {
    search: string;
    setSearch: (value: string) => void;
    category: string;
    setCategory: (value: ProjectCategory | "") => void;
    budgetMin: string;
    setBudgetMin: (value: string) => void;
    budgetMax: string;
    setBudgetMax: (value: string) => void;
    setPage: (value: number) => void;
    hasActiveFilters: boolean;
    clearFilters: () => void;
}

interface PillProps {
    label: string;
    onRemove: () => void;
}

function FilterPill({ label, onRemove }: PillProps) {
    return (
        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-medium text-primary bg-primary/8 border border-primary/15 px-2 py-0.5 rounded-sm transition-colors hover:bg-primary/12 group/pill">
            {label}
            <button
                type="button"
                onClick={onRemove}
                className="opacity-50 group-hover/pill:opacity-100 transition-opacity focus-visible:outline-none"
                aria-label={`Remove ${label} filter`}
            >
                <X className="w-2.5 h-2.5" />
            </button>
        </span>
    );
}

export function ProjectFilter({
    search,
    setSearch,
    category,
    setCategory,
    budgetMin,
    setBudgetMin,
    budgetMax,
    setBudgetMax,
    setPage,
    hasActiveFilters,
    clearFilters,
}: ProjectFilterProps) {
    const [open, setOpen] = useState(false);

    const activeCount = [category, budgetMin || budgetMax].filter(Boolean).length;

    const resetThen =
        <T,>(setter: (v: T) => void) =>
        (v: T) => { setter(v); setPage(0); };

    const categoryLabel = CATEGORY_OPTIONS.find((o) => o.value === category)?.label;
    const budgetLabel =
        budgetMin || budgetMax ? `$${budgetMin || "0"}–$${budgetMax || "∞"}` : null;

    return (
        <div className="space-y-2">
            {/* ── Command bar: search + filter toggle ───────────────────── */}
            <div className="flex items-center gap-1.5">
                <div className="relative flex-1 min-w-0">
                    <InputField
                        placeholder="Search projects or skills…"
                        startIcon={<Search className="w-3.5 h-3.5" />}
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                        aria-label="Search projects"
                        className="text-[13px] h-8 pl-8"
                    />
                </div>

                <Button
                    variant={open ? "primary" : "outline"}
                    onClick={() => setOpen((p) => !p)}
                    aria-expanded={open}
                    aria-controls="filter-tray"
                    size="sm"
                    className={cn(
                        "h-8 shrink-0 gap-1 text-xs font-mono px-2.5 transition-all duration-150",
                        !open && hasActiveFilters && "border-primary/30 text-primary",
                    )}
                >
                    <SlidersHorizontal className="w-3 h-3" />
                    {activeCount > 0 && (
                        <span className={cn(
                            "text-[10px] font-bold leading-none px-1 py-px rounded-sm tabular-nums",
                            open ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/15 text-primary",
                        )}>
                            {activeCount}
                        </span>
                    )}
                </Button>
            </div>

            {/* ── Active pills (collapsed state) ────────────────────────── */}
            {hasActiveFilters && !open && (
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    {categoryLabel && (
                        <FilterPill label={categoryLabel} onRemove={() => { setCategory(""); setPage(0); }} />
                    )}
                    {budgetLabel && (
                        <FilterPill label={budgetLabel} onRemove={() => { setBudgetMin(""); setBudgetMax(""); setPage(0); }} />
                    )}
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="font-mono text-[10px] text-muted-foreground/60 hover:text-muted-foreground underline underline-offset-2 transition-colors"
                    >
                        clear all
                    </button>
                </div>
            )}

            {/* ── Filter tray ────────────────────────────────────────────── */}
            {open && (
                <div
                    id="filter-tray"
                    className="border border-border/60 rounded-md bg-card/50 backdrop-blur-sm p-3 space-y-3"
                >
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <label className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-widest">
                                Category
                            </label>
                            <Select
                                value={category}
                                onChange={(e) => resetThen(setCategory)(e.target.value as ProjectCategory | "")}
                                placeholder="All"
                                options={CATEGORY_OPTIONS}
                            />
                        </div>
                       
                        <div className="space-y-1">
                            <label className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-widest">
                                Min ($)
                            </label>
                            <InputField
                                type="number"
                                placeholder="500"
                                value={budgetMin}
                                onChange={(e) => resetThen(setBudgetMin)(e.target.value)}
                                min={0}
                                aria-label="Minimum budget"
                                className="text-[13px] font-mono"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-widest">
                                Max ($)
                            </label>
                            <InputField
                                type="number"
                                placeholder="5,000"
                                value={budgetMax}
                                onChange={(e) => resetThen(setBudgetMax)(e.target.value)}
                                min={0}
                                aria-label="Maximum budget"
                                className="text-[13px] font-mono"
                            />
                        </div>
                    </div>

                    {hasActiveFilters && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-border/40">
                            {categoryLabel && (
                                <FilterPill label={categoryLabel} onRemove={() => { setCategory(""); setPage(0); }} />
                            )}
                            {budgetLabel && (
                                <FilterPill label={budgetLabel} onRemove={() => { setBudgetMin(""); setBudgetMax(""); setPage(0); }} />
                            )}
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="ml-auto font-mono text-[10px] text-muted-foreground/50 hover:text-muted-foreground underline underline-offset-2 transition-colors"
                            >
                                clear all
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}