"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Briefcase,
    LayoutDashboard,
    FileText,
    GitBranch,
    User,
    PlusCircle,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Settings,
    Shield,
    Users,
    BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
/* import { useAuthStore, useCurrentUser, useUserRole } from "@/store/auth-store"; */
import { Avatar } from "@/components/ui";
import type { Role } from "@/types";

// ─── Nav items by role ────────────────────────────────────────────────────────

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    roles: Role[];
    badge?: number;
    exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
    // ── Client ──────────────────────────────────────────────────────────────
    {
        label: "Overview",
        href: "/client",
        icon: <LayoutDashboard className="w-4 h-4" />,
        roles: ["CLIENT"],
        exact: true,
    },
    {
        label: "My Projects",
        href: "/client/projects",
        icon: <FileText className="w-4 h-4" />,
        roles: ["CLIENT"],
    },
    {
        label: "Post a Project",
        href: "/client/projects/create",
        icon: <PlusCircle className="w-4 h-4" />,
        roles: ["CLIENT"],
        exact: true,
    },
    {
        label: "Contracts",
        href: "/client/contracts",
        icon: <FileText className="w-4 h-4" />,
        roles: ["CLIENT"],
    },
    {
        label: "Profile",
        href: "/client/profile",
        icon: <User className="w-4 h-4" />,
        roles: ["CLIENT"],
        exact: true,
    },

    // ── Freelancer ───────────────────────────────────────────────────────────
    {
        label: "Overview",
        href: "/freelancer",
        icon: <LayoutDashboard className="w-4 h-4" />,
        roles: ["FREELANCER"],
        exact: true,
    },
    {
        label: "Browse Projects",
        href: "/projects",
        icon: <Briefcase className="w-4 h-4" />,
        roles: ["FREELANCER"],
    },
    {
        label: "My Bids",
        href: "/freelancer/bids",
        icon: <GitBranch className="w-4 h-4" />,
        roles: ["FREELANCER"],
        badge: 2,
    },
    {
        label: "Contracts",
        href: "/freelancer/contracts",
        icon: <FileText className="w-4 h-4" />,
        roles: ["FREELANCER"],
    },
    {
        label: "Profile",
        href: "/freelancer/profile",
        icon: <User className="w-4 h-4" />,
        roles: ["FREELANCER"],
        exact: true,
    },

    // ── Admin ────────────────────────────────────────────────────────────────
    {
        label: "All Users",
        href: "/admin/users",
        icon: <Users className="w-4 h-4" />,
        roles: ["ADMIN"],
    },
    {
        label: "All Projects",
        href: "/admin/projects",
        icon: <Shield className="w-4 h-4" />,
        roles: ["ADMIN"],
    },
    {
        label: "Platform Stats",
        href: "/admin/stats",
        icon: <BarChart3 className="w-4 h-4" />,
        roles: ["ADMIN"],
    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ROLES: Role[] = ["FREELANCER", "CLIENT", "ADMIN"];

const ROLE_LABELS: Record<Role, string> = {
    FREELANCER: "Freelancer",
    CLIENT: "Client",
    ADMIN: "Admin",
};

function isItemActive(pathname: string, item: NavItem): boolean {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + "/");
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
/*
export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();
    const user = useCurrentUser();
    const role = useUserRole();
    const logout = useAuthStore((s) => s.logout);
    const switchRole = useAuthStore((s) => s.switchRole);

    const visibleItems = NAV_ITEMS.filter(
        (item) => role && item.roles.includes(role),
    );

    return (
        <aside
            className={cn(
                "relative flex flex-col h-screen bg-card border-r border-border transition-all duration-300 ease-in-out shrink-0",
                collapsed ? "w-16" : "w-60",
            )}
        >
            <button
                onClick={() => setCollapsed((c) => !c)}
                className={cn(
                    "absolute -right-3 top-20 z-10",
                    "w-6 h-6 rounded-full border border-border bg-card shadow-md",
                    "flex items-center justify-center text-muted-foreground hover:text-foreground",
                    "transition-colors duration-200",
                )}
            >
                {collapsed ? (
                    <ChevronRight className="w-3 h-3" />
                ) : (
                    <ChevronLeft className="w-3 h-3" />
                )}
            </button>

            <div
                className={cn(
                    "flex items-center h-16 border-b border-border shrink-0 px-4",
                    collapsed ? "justify-center" : "gap-2.5",
                )}
            >
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4 text-primary-foreground" />
                </div>
                {!collapsed && (
                    <span className="font-bold text-sm text-foreground tracking-tight">
                        Freelance<span className="text-primary">Hub</span>
                    </span>
                )}
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
                {!collapsed && role && (
                    <div className="px-3 pb-2">
                        <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground/60">
                            {ROLE_LABELS[role]} Menu
                        </span>
                    </div>
                )}

                {visibleItems.map((item) => {
                    const active = isItemActive(pathname, item);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "relative group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                                collapsed ? "justify-center" : "",
                                active
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                            )}
                            title={collapsed ? item.label : undefined}
                        >
                            <span className="shrink-0">{item.icon}</span>

                            {!collapsed && (
                                <span className="flex-1 truncate">
                                    {item.label}
                                </span>
                            )}

                            {!collapsed && !!item.badge && item.badge > 0 && (
                                <span className="ml-auto text-[10px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                                    {item.badge}
                                </span>
                            )}

                            {collapsed && !!item.badge && item.badge > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-border p-3 space-y-2 shrink-0">
                {!collapsed && (
                    <div className="px-1 pb-1">
                        <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground/50 mb-2">
                            Demo: Switch Role
                        </p>
                        <div className="flex gap-1">
                            {ROLES.map((r) => (
                                <button
                                    key={r}
                                    onClick={() => switchRole(r)}
                                    className={cn(
                                        "flex-1 text-[10px] font-bold py-1 rounded-md transition-colors",
                                        role === r
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted text-muted-foreground hover:bg-muted/80",
                                    )}
                                >
                                    {r === "FREELANCER"
                                        ? "FL"
                                        : r === "CLIENT"
                                          ? "CL"
                                          : "AD"}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <Link
                    href="/settings"
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                        "text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
                        collapsed ? "justify-center" : "",
                    )}
                    title={collapsed ? "Settings" : undefined}
                >
                    <Settings className="w-4 h-4 shrink-0" />
                    {!collapsed && "Settings"}
                </Link>

                <div
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2",
                        collapsed ? "justify-center" : "",
                    )}
                >
                    {user && <Avatar name={user.name} size="sm" />}
                    {!collapsed && user && (
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">
                                {user.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate">
                                {user.email}
                            </p>
                        </div>
                    )}
                    {!collapsed && (
                        <button
                            onClick={logout}
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-destructive transition-colors shrink-0"
                            title="Sign out"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>
        </aside>
    );
}

*/

// ─── Mobile sidebar overlay ───────────────────────────────────────────────────

interface MobileSidebarProps {
    open: boolean;
    onClose: () => void;
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
    if (!open) return null;
    return (
        <>
            <div
                className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="fixed left-0 top-0 bottom-0 z-50 w-64">
                {/* <Sidebar /> */}
            </div>
        </>
    );
}
