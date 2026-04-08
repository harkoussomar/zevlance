"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ChevronRight, Home } from "lucide-react";
import { cn } from "@/modules/shared";
import { MobileSidebar } from "./MobileSidebar";
import { NotificationBell } from "@/modules/notification";

const PATH_LABELS: Record<string, string> = {
    dashboard: "Overview",
    projects: "Projects",
    create: "New Project",
    bids: "My Bids",
    contracts: "Contracts",
    profile: "Profile",
    settings: "Settings",
    client: "Client",
    freelancer: "Freelancer",
    admin: "Admin",
    users: "All Users",
    stats: "Platform Stats",
    edit: "Edit",
};

function segmentLabel(seg: string): string {
    if (PATH_LABELS[seg]) return PATH_LABELS[seg];
    if (/^[0-9a-f-]{36}$/.test(seg)) return "Detail";
    return seg.charAt(0).toUpperCase() + seg.slice(1);
}

function useBreadcrumbs() {
    const pathname = usePathname();
    const segments = pathname.split("/").filter(Boolean);
    return segments.map((seg, i) => ({
        label: segmentLabel(seg),
        href: "/" + segments.slice(0, i + 1).join("/"),
        isLast: i === segments.length - 1,
    }));
}

export function Topbar() {
    const breadcrumbs = useBreadcrumbs();
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const closeMobileSidebar = useCallback(() => setMobileSidebarOpen(false), []);
    const isRootSegment = breadcrumbs.length <= 1;

    return (
        <>
            <MobileSidebar open={mobileSidebarOpen} onClose={closeMobileSidebar} />

            <header
                className={cn(
                    "h-16 border-b border-border",
                    "bg-background/95 backdrop-blur-sm",
                    "flex items-center px-4 gap-3",
                    "shrink-0 sticky top-0 z-30",
                )}
            >
                {/* Mobile menu button */}
                <button
                    className="lg:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setMobileSidebarOpen(true)}
                    aria-label="Open menu"
                >
                    <Menu className="w-5 h-5" />
                </button>

                {/* Breadcrumbs */}
                <nav
                    aria-label="Breadcrumb"
                    className="flex items-center gap-1 min-w-0 flex-1"
                >
                    {!isRootSegment && (
                        <>
                            <Link
                                href={`/${breadcrumbs[0].href.split("/")[1]}`}
                                className="text-muted-foreground hover:text-foreground transition-colors shrink-0 p-1 rounded hover:bg-muted"
                            >
                                <Home className="w-3.5 h-3.5" />
                            </Link>
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                        </>
                    )}

                    {breadcrumbs.map((crumb, i) => {
                        if (!isRootSegment && i === 0) return null;
                        return (
                            <React.Fragment key={crumb.href}>
                                {i > (isRootSegment ? 0 : 1) && (
                                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                                )}
                                {crumb.isLast ? (
                                    <span className="text-sm font-semibold text-foreground truncate">
                                        {crumb.label}
                                    </span>
                                ) : (
                                    <Link
                                        href={crumb.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors truncate"
                                    >
                                        {crumb.label}
                                    </Link>
                                )}
                            </React.Fragment>
                        );
                    })}
                </nav>

                {/* Right-side actions */}
                <div className="flex items-center gap-1 shrink-0">
                    <div className="relative">
                        <NotificationBell />
                    </div>
                </div>
            </header>
        </>
    );
}