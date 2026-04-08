import React from "react";
import {
    Briefcase,
    LayoutDashboard,
    FileText,
    GitBranch,
    Shield,
    Users,
    BarChart3,
} from "lucide-react";
import type { Role } from "@/modules/shared/types";
import { NavItem } from "../types";

export const NAV_ITEMS: NavItem[] = [
    // ── CLIENT ──────────────────────────────────────────────────────────────
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
        icon: <Briefcase className="w-4 h-4" />,
        roles: ["CLIENT"],
    },
    {
        label: "Contracts",
        href: "/client/contracts",
        icon: <FileText className="w-4 h-4" />,
        roles: ["CLIENT"],
    },

    // ── FREELANCER ───────────────────────────────────────────────────────────
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
    },
    {
        label: "Contracts",
        href: "/freelancer/contracts",
        icon: <FileText className="w-4 h-4" />,
        roles: ["FREELANCER"],
    },

    // ── ADMIN ────────────────────────────────────────────────────────────────
    {
        label: "All Users",
        href: "/admin/users",
        icon: <Users className="w-4 h-4" />,
        roles: ["ADMIN"],
    },
    {
        label: "Projects",
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

export const ROLE_CONFIG: Record<
    Role,
    { label: string; dotClass: string; textClass: string; profileHref: string }
> = {
    CLIENT: {
        label: "Client",
        dotClass: "bg-blue-500",
        textClass: "text-blue-500",
        profileHref: "/client/profile",
    },
    FREELANCER: {
        label: "Freelancer",
        dotClass: "bg-emerald-500",
        textClass: "text-emerald-500",
        profileHref: "/freelancer/profile",
    },
    ADMIN: {
        label: "Admin",
        dotClass: "bg-rose-500",
        textClass: "text-rose-500",
        profileHref: "/admin/profile",
    },
};
