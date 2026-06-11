"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Briefcase,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Settings,
    ExternalLink,
} from "lucide-react";
import { cn } from "@/modules/shared";
import { selectRole, useAuthStore } from "@/store/auth-store";
import { SmartAvatar } from "@/modules/shared/components/avatar";
import { useLogout } from "@/modules/auth/hooks/useLogout";
import { SidebarProps } from "../types";
import { NAV_ITEMS, ROLE_CONFIG } from "../config/config";
import { isItemActive } from "../utils";
import { useMyBasicProfile } from "@/modules/profile/public";

export function Sidebar({ isMobile = false }: SidebarProps) {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();
    const role = useAuthStore(selectRole);
    const { handleLogout } = useLogout();

    const { data: profile } = useMyBasicProfile();

    const isCollapsed = !isMobile && collapsed;
    const visibleItems = NAV_ITEMS.filter(
        (item) => role && item.roles.includes(role),
    );
    const roleConfig = role ? ROLE_CONFIG[role] : null;

    return (
        <aside
            className={cn(
                "relative flex flex-col h-full bg-card border-r border-border transition-all duration-300 ease-in-out shrink-0",
                isCollapsed ? "w-16" : "w-60",
            )}
        >
            {/* ── Collapse toggle (desktop only) ─────────────────────────────── */}
            {!isMobile && (
                <button
                    onClick={() => setCollapsed((c) => !c)}
                    className={cn(
                        "absolute -right-3 top-18 z-10",
                        "w-6 h-6 rounded-full border border-border bg-card shadow-sm",
                        "flex items-center justify-center text-muted-foreground",
                        "hover:text-foreground hover:border-primary/40 hover:shadow-md",
                        "transition-all duration-200",
                    )}
                    aria-label={
                        collapsed ? "Expand sidebar" : "Collapse sidebar"
                    }
                >
                    {collapsed ? (
                        <ChevronRight className="w-3 h-3" />
                    ) : (
                        <ChevronLeft className="w-3 h-3" />
                    )}
                </button>
            )}

            {/* ── Logo ───────────────────────────────────────────────────────── */}
            <div
                className={cn(
                    "flex items-center h-16 border-b border-border shrink-0 px-4",
                    isCollapsed ? "justify-center" : "gap-3",
                )}
            >
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-sm">
                    <Briefcase className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                {!isCollapsed && (
                    <span className="font-bold text-sm text-foreground tracking-tight font-display">
                        Zevlance
                    </span>
                )}
            </div>

            {/* ── Nav ────────────────────────────────────────────────────────── */}
            <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
                {/* Role section label */}
                {!isCollapsed && roleConfig && (
                    <div className="flex items-center gap-2 px-3 pb-3 pt-1">
                        <span
                            className={cn(
                                "w-1.5 h-1.5 rounded-full shrink-0",
                                roleConfig.dotClass,
                            )}
                        />
                        <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground/70">
                            {roleConfig.label}
                        </span>
                    </div>
                )}

                {/* Role dot only when collapsed */}
                {isCollapsed && roleConfig && (
                    <div className="flex justify-center pb-2">
                        <span
                            className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                roleConfig.dotClass,
                            )}
                            title={roleConfig.label}
                        />
                    </div>
                )}

                {visibleItems.map((item) => {
                    const active = isItemActive(pathname, item);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={isCollapsed ? item.label : undefined}
                            className={cn(
                                "relative group flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150",
                                isCollapsed
                                    ? "justify-center px-2 py-2.5"
                                    : "px-3 py-2",
                                active
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                            )}
                        >
                            {/* Active left indicator */}
                            {active && !isCollapsed && (
                                <span className="absolute left-1 top-1/2 -translate-y-1/2 w-0.5 h-4.5 rounded-full bg-primary" />
                            )}

                            <span className="shrink-0">{item.icon}</span>

                            {!isCollapsed && (
                                <span className="flex-1 truncate">
                                    {item.label}
                                </span>
                            )}

                            {/* Badge */}
                            {!isCollapsed && !!item.badge && item.badge > 0 && (
                                <span className="ml-auto text-[10px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full leading-none">
                                    {item.badge}
                                </span>
                            )}
                            {isCollapsed && !!item.badge && item.badge > 0 && (
                                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* ── Footer ─────────────────────────────────────────────────────── */}
            <div className="shrink-0">
                {/* Settings */}
                <div className="px-2 pt-2">
                    <Link
                        href="/settings"
                        title={isCollapsed ? "Settings" : undefined}
                        className={cn(
                            "flex items-center gap-3 rounded-lg text-sm font-medium text-muted-foreground",
                            "hover:bg-muted/60 hover:text-foreground transition-colors duration-150",
                            isCollapsed
                                ? "justify-center px-2 py-2.5"
                                : "px-3 py-2",
                        )}
                    >
                        <Settings className="w-4 h-4 shrink-0" />
                        {!isCollapsed && "Settings"}
                    </Link>
                </div>

                {/* User card */}
                <div className="p-2">
                    <div
                        className={cn(
                            "rounded-lg border border-border bg-muted/30 overflow-hidden",
                            isCollapsed ? "p-2" : "p-0",
                        )}
                    >
                        {isCollapsed ? (
                            <div className="flex flex-col items-center gap-1">
                                {profile && roleConfig && (
                                    <Link
                                        href={roleConfig.profileHref}
                                        title={`${profile.name} — Profile`}
                                    >
                                        <SmartAvatar
                                            name={profile.name}
                                            size="sm"
                                        />
                                    </Link>
                                )}
                                <button
                                    onClick={handleLogout}
                                    title="Sign out"
                                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                                >
                                    <LogOut className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ) : (
                            <div>
                                {profile && roleConfig && (
                                    <Link
                                        href={roleConfig.profileHref}
                                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/60 transition-colors rounded-lg group"
                                    >
                                        <SmartAvatar
                                            name={profile.name}
                                            size="sm"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-foreground truncate leading-tight">
                                                {profile.name}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
                                                {profile.email}
                                            </p>
                                        </div>
                                        <ExternalLink className="w-3 h-3 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors shrink-0" />
                                    </Link>
                                )}

                                <div className="flex items-center justify-between px-3 pb-2 pt-0.5">
                                    {roleConfig && (
                                        <span
                                            className={cn(
                                                "text-[10px] font-bold tracking-wide",
                                                roleConfig.textClass,
                                            )}
                                        >
                                            ● {roleConfig.label}
                                        </span>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        title="Sign out"
                                        className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground hover:text-destructive transition-colors ml-auto"
                                    >
                                        <LogOut className="w-3 h-3" />
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
}
