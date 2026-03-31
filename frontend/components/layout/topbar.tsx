"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Bell,
    Menu,
    Search,
    ChevronRight,
    Check,
    Briefcase,
    GitBranch,
    FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
/* import { useCurrentUser } from "@/store/auth-store"; */
import { Avatar } from "@/components/ui";
import { formatRelative } from "@/lib/utils";
import { MobileSidebar } from "./sidebar";

// ─── Breadcrumb builder ───────────────────────────────────────────────────────

const PATH_LABELS: Record<string, string> = {
    dashboard: "Overview",
    projects: "Projects",
    create: "Create Project",
    bids: "My Bids",
    contracts: "Contracts",
    profile: "Profile",
    "my-projects": "My Projects",
    settings: "Settings",
};

function useBreadcrumbs() {
    const pathname = usePathname();
    const segments = pathname.split("/").filter(Boolean);

    return segments.map((seg, i) => ({
        label: PATH_LABELS[seg] ?? (seg.length === 36 ? "Detail" : seg),
        href: "/" + segments.slice(0, i + 1).join("/"),
        isLast: i === segments.length - 1,
    }));
}

// ─── Mock notifications ───────────────────────────────────────────────────────

const MOCK_NOTIFICATIONS = [
    {
        id: "1",
        icon: <GitBranch className="w-4 h-4" />,
        title: "New bid on your project",
        body: "Karim B. submitted a proposal for Spring Boot REST API",
        time: "2026-03-26T12:00:00",
        read: false,
    },
    {
        id: "2",
        icon: <Check className="w-4 h-4 text-emerald-500" />,
        title: "Milestone approved",
        body: "Fatima Z. approved Milestone 2: Product Catalog & Search",
        time: "2026-03-25T16:30:00",
        read: false,
    },
    {
        id: "3",
        icon: <FileText className="w-4 h-4" />,
        title: "Contract created",
        body: "Your bid was accepted — contract is now active",
        time: "2026-02-15T10:00:00",
        read: true,
    },
    {
        id: "4",
        icon: <Briefcase className="w-4 h-4" />,
        title: "New project matching your skills",
        body: "DevOps: Kubernetes Migration — $1K–$3K",
        time: "2026-03-24T09:00:00",
        read: true,
    },
];

// ─── Topbar ───────────────────────────────────────────────────────────────────

export function Topbar() {
   /*  const user = useCurrentUser(); */
    const breadcrumbs = useBreadcrumbs();
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAllRead = () =>
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    return (
        <>
            <MobileSidebar
                open={mobileSidebarOpen}
                onClose={() => setMobileSidebarOpen(false)}
            />

            <header className="h-16 border-b border-border bg-background/95 backdrop-blur-sm flex items-center px-4 gap-4 shrink-0 sticky top-0 z-30">
                {/* Mobile menu button */}
                <button
                    className="lg:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground"
                    onClick={() => setMobileSidebarOpen(true)}
                >
                    <Menu className="w-5 h-5" />
                </button>

                {/* Breadcrumbs */}
                <nav className="flex items-center gap-1.5 min-w-0 flex-1">
                    {breadcrumbs.map((crumb, i) => (
                        <React.Fragment key={crumb.href}>
                            {i > 0 && (
                                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
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
                    ))}
                </nav>

                {/* Right actions */}
                <div className="flex items-center gap-2 shrink-0">
                    {/* Search */}
                    <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/50 text-muted-foreground text-sm hover:bg-muted transition-colors">
                        <Search className="w-3.5 h-3.5" />
                        <span className="text-xs">Search…</span>
                        <kbd className="text-[10px] bg-background border border-border rounded px-1">
                            ⌘K
                        </kbd>
                    </button>

                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications((s) => !s)}
                            className="relative p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Bell className="w-4.5 h-4.5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notification dropdown */}
                        {showNotifications && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowNotifications(false)}
                                />
                                <div className="absolute right-0 top-full mt-2 w-80 z-20 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                                        <div>
                                            <h3 className="text-sm font-bold text-foreground">
                                                Notifications
                                            </h3>
                                            {unreadCount > 0 && (
                                                <p className="text-xs text-muted-foreground">
                                                    {unreadCount} unread
                                                </p>
                                            )}
                                        </div>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={markAllRead}
                                                className="text-xs text-primary font-semibold hover:underline"
                                            >
                                                Mark all read
                                            </button>
                                        )}
                                    </div>

                                    <div className="divide-y divide-border max-h-80 overflow-y-auto">
                                        {notifications.map((n) => (
                                            <div
                                                key={n.id}
                                                className={cn(
                                                    "flex gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer",
                                                    !n.read && "bg-primary/3",
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                                                        "bg-muted text-muted-foreground",
                                                    )}
                                                >
                                                    {n.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p
                                                        className={cn(
                                                            "text-xs leading-tight mb-0.5",
                                                            n.read
                                                                ? "font-medium text-foreground"
                                                                : "font-bold text-foreground",
                                                        )}
                                                    >
                                                        {n.title}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {n.body}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                                                        {formatRelative(n.time)}
                                                    </p>
                                                </div>
                                                {!n.read && (
                                                    <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t border-border px-4 py-2.5">
                                        <button className="text-xs text-primary font-semibold hover:underline w-full text-center">
                                            View all notifications
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* User pill */}
                    {/* {user && (
                        <Link
                            href="/profile"
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
                        >
                            <Avatar name={user.name} size="xs" />
                            <div className="hidden sm:block text-left">
                                <p className="text-xs font-semibold text-foreground leading-none">
                                    {user.name}
                                </p>
                                <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
                                    {user.role}
                                </p>
                            </div>
                        </Link>
                    )} */}
                </div>
            </header>
        </>
    );
}
