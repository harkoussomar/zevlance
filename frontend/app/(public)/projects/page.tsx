"use client";

import { useCallback, useState, useMemo } from "react";
import { ArrowLeft } from "lucide-react";

import { Navbar } from "@/modules/landing-page/components/Navbar";
import { Button } from "@/modules/shared/components/button";
import { cn } from "@/modules/shared";

import { ProjectDetailPanel, ProjectFilters, ProjectListPanel } from "@/modules/project/public";
import { ProjectFilter } from "@/modules/project/public/components/ProjectFilters"; 
import type { ProjectCategory } from "@/modules/project/shared";

const PAGE_SIZE = 10;

export default function ProjectsPage() {
    const [selectedId, setSelectedId] = useState<string>("");
    const [isDetailActive, setIsDetailActive] = useState(false);

    // ── Filter State ────────────────────────────────────────────────────────
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

    const clearFilters = useCallback(() => {
        setCategory("");
        setBudgetMin("");
        setBudgetMax("");
        setSearch("");
        setPage(0);
    }, []);

    // ── Handlers ────────────────────────────────────────────────────────────
    const handleSelect = useCallback((id: string) => {
        setSelectedId(id);
        setIsDetailActive(true);
    }, []);

    const handleAutoSelect = useCallback((id: string) => {
        setSelectedId(id);
    }, []);

    const handleBack = useCallback(() => {
        setIsDetailActive(false);
    }, []);

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-background font-sans selection:bg-primary/20 selection:text-primary">
            <Navbar />

            {/* ── Outer Page Header (Filters) ──────────────────────────── */}
            <header className="relative mt-16 shrink-0 border-b border-border bg-background px-4 py-6 sm:px-8 z-20 w-full overflow-hidden">
                {/* Subtle environmental effect */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
                
                <div className="relative mx-auto w-full max-w-400 space-y-5 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-baseline justify-between gap-2">
                        <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground tracking-tight">
                            Browse Projects
                        </h1>
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
            </header>

            {/* ── Split-panel container ──────────────────────────────────── */}
            <div className="flex flex-1 overflow-hidden mx-auto w-full max-w-400 bg-background relative z-10">
                {/* ── Left: Project list ───────────────────────────────────── */}
                <aside
                    className={cn(
                        "shrink-0 border-r border-border flex flex-col overflow-hidden bg-background/50",
                        "w-full md:w-[22rem] lg:w-[26rem] xl:w-[28rem]",
                        isDetailActive ? "hidden md:flex" : "flex",
                    )}
                >
                    <ProjectListPanel
                        selectedId={selectedId}
                        onSelect={handleSelect}
                        onAutoSelect={handleAutoSelect}
                        filters={filters}
                        onPageChange={setPage}
                        hasActiveFilters={hasActiveFilters}
                        onClearFilters={clearFilters}
                    />
                </aside>

                {/* ── Right: Project detail ────────────────────────────────── */}
                <main
                    className={cn(
                        "flex-1 overflow-y-auto bg-muted/10 relative",
                        !isDetailActive && "hidden md:block",
                    )}
                >
                    {/* Detail background environmental noise/gradient */}
                    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-50 mix-blend-multiply dark:mix-blend-screen" />

                    {/* Mobile back navigation */}
                    <div className="sticky top-0 z-10 flex md:hidden items-center gap-2 px-4 py-3 bg-background/80 backdrop-blur-md border-b border-border">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleBack}
                            className="-ml-2 gap-1.5 text-muted-foreground hover:text-foreground font-mono text-xs uppercase tracking-widest"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Directory
                        </Button>
                    </div>

                    <div className="relative p-0 sm:p-8 md:p-12 max-w-5xl mx-auto h-full">
                        <ProjectDetailPanel projectId={selectedId} />
                    </div>
                </main>
            </div>
        </div>
    );
}