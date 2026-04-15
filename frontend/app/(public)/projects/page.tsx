"use client";

import { useCallback, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { Navbar } from "@/modules/landing-page/components/Navbar";
import { Button } from "@/modules/shared/components/button";
import { cn } from "@/modules/shared";
import { ProjectDetailPanel, ProjectListPanel } from "@/modules/project/public";

/**
 * ProjectsPage
 *
 * Orchestrates the split-panel layout for browsing and viewing projects.
 *
 * Responsive behaviour:
 *  - Mobile  (<md): single-panel view — list OR detail, toggled by selection / back button.
 *  - Tablet+ (≥md): persistent split layout — list on the left, detail on the right.
 */
export default function ProjectsPage() {
    const [selectedId, setSelectedId] = useState<string>("");

    /**
     * Tracks whether the detail panel is the active view on narrow screens.
     * On ≥md the split is always visible, so this flag only affects mobile.
     */
    const [isDetailActive, setIsDetailActive] = useState(false);

    /**
     * Called when the user explicitly clicks a project row.
     * Navigates to the detail panel on mobile as well.
     */
    const handleSelect = useCallback((id: string) => {
        setSelectedId(id);
        setIsDetailActive(true);
    }, []);

    /**
     * Called when the list auto-selects the first item on load/filter change.
     * Updates the highlighted item but does NOT force-open the detail panel
     * on mobile, so users can still browse the list freely.
     */
    const handleAutoSelect = useCallback((id: string) => {
        setSelectedId(id);
    }, []);

    const handleBack = useCallback(() => {
        setIsDetailActive(false);
    }, []);

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-background">
            <Navbar />

            {/* ── Split-panel container ──────────────────────────────────── */}
            <div className="flex flex-1 overflow-hidden mt-16 mx-auto w-full max-w-400">
                {/* ── Left: Project list ───────────────────────────────────── */}
                <aside
                    className={cn(
                        "shrink-0 border-r border-border flex flex-col overflow-hidden bg-background",
                        // Responsive widths
                        "w-full md:w-80 lg:w-88 xl:w-96",
                        // On mobile, hide when the detail panel is active
                        isDetailActive ? "hidden md:flex" : "flex",
                    )}
                >
                    <ProjectListPanel
                        selectedId={selectedId}
                        onSelect={handleSelect}
                        onAutoSelect={handleAutoSelect}
                    />
                </aside>

                {/* ── Right: Project detail ────────────────────────────────── */}
                <main
                    className={cn(
                        "flex-1 overflow-y-auto bg-muted/20",
                        // On mobile, hide when no project is selected or list is active
                        !isDetailActive && "hidden md:block",
                    )}
                >
                    {/* Mobile back navigation */}
                    <div className="sticky top-0 z-10 flex md:hidden items-center gap-2 px-4 py-3 bg-background/95 backdrop-blur-sm border-b border-border">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleBack}
                            className="-ml-2 gap-1.5 text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            All Projects
                        </Button>
                    </div>

                    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
                        <ProjectDetailPanel projectId={selectedId} />
                    </div>
                </main>
            </div>
        </div>
    );
}
