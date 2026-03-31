"use client";

import { useState } from "react";
import { Navbar } from "@/modules/landing-page/components/Navbar";
import { ProjectListPanel } from "@/modules/projects/components/ProjectListPanel";
import { ProjectDetailPanel } from "@/modules/projects/components/ProjectDetailPanel";

export default function ProjectsPage() {
    const [selectedId, setSelectedId] = useState<string>("");

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-background">
            <Navbar />

            {/* Split panel layout - fills the remaining viewport height */}
            <div className="flex flex-1 overflow-hidden mx-auto w-full max-w-400 mt-16">
                {/* ── Left panel: project list ───────────────────────── */}
                <aside className="w-80 shrink-0 border-r border-border flex flex-col overflow-hidden bg-background">
                    <ProjectListPanel
                        selectedId={selectedId}
                        onSelect={setSelectedId}
                    />
                </aside>

                {/* ── Right panel: project detail ────────────────────── */}
                <main className="flex-1 overflow-y-auto bg-muted/20">
                    <div className="p-6 max-w-4xl mx-auto h-full">
                        <ProjectDetailPanel projectId={selectedId} />
                    </div>
                </main>
            </div>
        </div>
    );
}