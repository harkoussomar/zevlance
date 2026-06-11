"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/modules/shared";
import { Button } from "@/modules/shared/components/button";
import { InputField } from "@/modules/shared/components/input";
import { 
    Select, 
    SelectTrigger, 
    SelectValue, 
    SelectContent, 
    SelectItem 
} from "@/modules/shared/components/select";
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

function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium text-primary bg-primary/10 border border-primary/20 pl-2.5 pr-1.5 py-1 rounded-none transition-colors hover:bg-primary/15 group/pill animate-in zoom-in-95 duration-200">
            {label}
            <button
                type="button"
                onClick={onRemove}
                className="opacity-60 group-hover/pill:opacity-100 transition-opacity focus-visible:outline-none hover:bg-primary/20 p-0.5"
                aria-label={`Remove ${label} filter`}
            >
                <X className="w-3 h-3" />
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
    const resetThen = <T,>(setter: (v: T) => void) => (v: T) => { setter(v); setPage(0); };

    const categoryLabel = CATEGORY_OPTIONS.find((o) => o.value === category)?.label;
    const budgetLabel = budgetMin || budgetMax ? `$${budgetMin || "0"}–$${budgetMax || "∞"}` : null;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="relative flex-1 min-w-0">
                    <InputField
                        placeholder="Search project titles or skills..."
                        startIcon={<Search className="w-4 h-4 text-muted-foreground/60" />}
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                        aria-label="Search projects"
                        className="h-11 text-[14px] pl-10 bg-background border-border/60 hover:border-border focus:border-primary rounded-none shadow-sm transition-all"
                    />
                </div>

                <Button
                    variant={open ? "primary" : "outline"}
                    onClick={() => setOpen((p) => !p)}
                    aria-expanded={open}
                    aria-controls="filter-tray"
                    className={cn(
                        "h-11 gap-2 text-[13px] font-mono px-4 rounded-none transition-all duration-300",
                        !open && hasActiveFilters && "border-primary/40 text-primary bg-primary/5",
                        open && "shadow-md shadow-primary/20"
                    )}
                >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    Filters
                    {activeCount > 0 && (
                        <span className={cn(
                            "flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full ml-1 tabular-nums",
                            open ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground"
                        )}>
                            {activeCount}
                        </span>
                    )}
                </Button>
            </div>

            {hasActiveFilters && !open && (
                <div className="flex items-center gap-2 flex-wrap animate-in fade-in slide-in-from-top-2 duration-300">
                    {categoryLabel && <FilterPill label={categoryLabel} onRemove={() => { setCategory(""); setPage(0); }} />}
                    {budgetLabel && <FilterPill label={budgetLabel} onRemove={() => { setBudgetMin(""); setBudgetMax(""); setPage(0); }} />}
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="ml-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
                    >
                        Clear Active
                    </button>
                </div>
            )}

            {open && (
                <div
                    id="filter-tray"
                    className="border border-border/80 bg-card/60 backdrop-blur-xl p-5 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200 shadow-xl shadow-background/50 relative overflow-hidden"
                >
                    {/* Decorative industrial accent */}
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                        <div className="space-y-2">
                            <label className="font-mono text-[11px] text-foreground/70 uppercase tracking-widest font-semibold flex items-center gap-2">
                                <span className="w-1 h-1 bg-primary rounded-full"></span> Category
                            </label>
                            <Select
                                value={category === "" ? "all" : category}
                                onValueChange={(val) => resetThen(setCategory)(val === "all" ? "" : (val as ProjectCategory))}
                            >
                                <SelectTrigger className="h-10 text-[13px] rounded-none border-border/60 bg-background/50">
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent className="rounded-none border-border/80">
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {CATEGORY_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                       
                        <div className="space-y-2">
                            <label className="font-mono text-[11px] text-foreground/70 uppercase tracking-widest font-semibold flex items-center gap-2">
                                <span className="w-1 h-1 bg-primary/60 rounded-full"></span> Min Budget ($)
                            </label>
                            <InputField
                                type="number"
                                placeholder="e.g. 500"
                                value={budgetMin}
                                onChange={(e) => resetThen(setBudgetMin)(e.target.value)}
                                min={0}
                                className="h-10 text-[13px] font-mono rounded-none bg-background/50 border-border/60"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="font-mono text-[11px] text-foreground/70 uppercase tracking-widest font-semibold flex items-center gap-2">
                                <span className="w-1 h-1 bg-primary/60 rounded-full"></span> Max Budget ($)
                            </label>
                            <InputField
                                type="number"
                                placeholder="e.g. 5000"
                                value={budgetMax}
                                onChange={(e) => resetThen(setBudgetMax)(e.target.value)}
                                min={0}
                                className="h-10 text-[13px] font-mono rounded-none bg-background/50 border-border/60"
                            />
                        </div>
                    </div>

                    {hasActiveFilters && (
                        <div className="flex items-center gap-2 flex-wrap pt-5 mt-2 border-t border-border/40">
                            {categoryLabel && <FilterPill label={categoryLabel} onRemove={() => { setCategory(""); setPage(0); }} />}
                            {budgetLabel && <FilterPill label={budgetLabel} onRemove={() => { setBudgetMin(""); setBudgetMax(""); setPage(0); }} />}
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="ml-auto font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:text-destructive underline underline-offset-4 transition-colors"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}