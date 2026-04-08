"use client";

import Link from "next/link";
import {
    ArrowRight,
    Bell,
    Briefcase,
    CheckCircle2,
    ChevronDown,
    FileText,
    LayoutDashboard,
    LogOut,
    MessageSquare,
    Settings,
    Sparkles,
    Users,
} from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/modules/shared/components/dropdown-menu";
import { Avatar } from "@/modules/shared/components/avatar";
import { ThemeToggle } from "@/modules/shared/components/theme-toggle";
import { useLogout } from "@/modules/auth/hooks/useLogout";
import { selectIsAuthenticated, useAuthStore } from "@/store/auth-store";
import { ROLE_REDIRECT } from "@/modules/shared";
import { cn } from "@/modules/shared";
import { useMyBasicProfile } from "@/modules/profile/hooks/useProfile";

// ─── Types ────────────────────────────────────────────────────────────────────

type NotificationType = "bid" | "message" | "contract" | "system";

interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    description: string;
    time: string;
    read: boolean;
}

// ─── Mock data (replace with real hook later) ─────────────────────────────────

const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: "1",
        type: "bid",
        title: "New proposal received",
        description: 'Alex M. submitted a bid on "React Dashboard"',
        time: "2m ago",
        read: false,
    },
    {
        id: "2",
        type: "contract",
        title: "Contract signed",
        description: "Your contract with Sara D. is now active",
        time: "1h ago",
        read: false,
    },
    {
        id: "3",
        type: "message",
        title: "Client replied",
        description: "New message on your active proposal",
        time: "3h ago",
        read: true,
    },
];

// ─── Constants ────────────────────────────────────────────────────────────────

/** Icon + colour per notification type */
const NOTIFICATION_ICON: Record<
    NotificationType,
    { icon: React.ElementType; bg: string; color: string }
> = {
    bid: { icon: Users, bg: "bg-primary/10", color: "text-primary" },
    message: { icon: MessageSquare, bg: "bg-info/10", color: "text-info" },
    contract: { icon: FileText, bg: "bg-success/10", color: "text-success" },
    system: { icon: Sparkles, bg: "bg-warning/10", color: "text-warning" },
};

/** Role badge colours from the design system */
const ROLE_STYLE: Record<string, { label: string; className: string }> = {
    FREELANCER: {
        label: "Freelancer",
        className: "bg-success/10 text-success border-success/20",
    },
    CLIENT: {
        label: "Client",
        className: "bg-info/10 text-info border-info/20",
    },
    ADMIN: {
        label: "Admin",
        className: "bg-destructive/10 text-destructive border-destructive/20",
    },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface NotificationItemProps {
    notification: Notification;
}

function NotificationItem({ notification }: NotificationItemProps) {
    const meta = NOTIFICATION_ICON[notification.type];
    const Icon = meta.icon;

    return (
        <div
            className={cn(
                "flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors duration-100",
                "hover:bg-muted/60 cursor-pointer",
                !notification.read && "bg-primary/3",
            )}
        >
            {/* Icon container */}
            <div
                className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                    meta.bg,
                )}
            >
                <Icon className={cn("w-3.5 h-3.5", meta.color)} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-foreground truncate">
                        {notification.title}
                    </p>
                    {!notification.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    )}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                    {notification.description}
                </p>
                <p className="text-[10px] text-muted-foreground/70 mt-1 font-medium">
                    {notification.time}
                </p>
            </div>
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AuthHeaderActions() {
    const isAuthenticated = useAuthStore(selectIsAuthenticated);
    const { data: profile } = useMyBasicProfile();
    const { handleLogout } = useLogout();

    const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;
    const roleStyle = profile?.role ? ROLE_STYLE[profile.role] : null;
    const dashboardHref = profile?.role
        ? ROLE_REDIRECT[profile.role as keyof typeof ROLE_REDIRECT]
        : "/";
    const contractsHref = profile?.role
        ? `${ROLE_REDIRECT[profile.role as keyof typeof ROLE_REDIRECT]}/contracts`
        : "/";

    // ── Unauthenticated ──────────────────────────────────────────────────────
    if (!isAuthenticated) {
        return (
            <div className="flex items-center gap-2 sm:gap-3">
                <ThemeToggle />

                <Link
                    href="/login"
                    className="hidden sm:block text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors duration-100"
                >
                    Sign in
                </Link>

                <Link
                    href="/register"
                    className={cn(
                        "inline-flex items-center gap-1.5",
                        "text-sm font-bold",
                        "px-4 py-2 rounded-lg",
                        "bg-foreground text-background",
                        "hover:bg-foreground/90",
                        "transition-all duration-100",
                        "shadow-sm hover:shadow-md",
                        "active:scale-95",
                    )}
                >
                    Get started
                    <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </div>
        );
    }

    // ── Authenticated ────────────────────────────────────────────────────────
    return (
        <div className="flex items-center gap-1.5">
            <ThemeToggle />

            <DropdownMenu>
                {/* ── Trigger ─────────────────────────────────────────────── */}
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        className={cn(
                            "relative flex items-center gap-2.5",
                            "pl-2 pr-2.5 py-1.5 rounded-xl",
                            "hover:bg-muted",
                            "transition-colors duration-100",
                            "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                            "group",
                        )}
                        aria-label="Open account menu"
                    >
                        {/* Avatar */}
                        <div className="relative">
                            <Avatar
                                name={profile?.name ?? "User"}
                                src={profile?.profilePicture ?? undefined}
                                size="sm"
                            />
                            {/* Unread notification dot */}
                            {unreadCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground ring-2 ring-background leading-none">
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </span>
                            )}
                        </div>

                        {/* Name — hidden on small screens */}
                        <span className="hidden sm:block text-sm font-semibold text-foreground max-w-3 truncate">
                            {profile?.name ?? "Account"}
                        </span>

                        <ChevronDown
                            className={cn(
                                "hidden sm:block w-3.5 h-3.5 text-muted-foreground",
                                "transition-all duration-200",
                                "group-data-[state=open]:rotate-180 group-data-[state=open]:text-foreground",
                            )}
                        />
                    </button>
                </DropdownMenuTrigger>

                {/* ── Content ─────────────────────────────────────────────── */}
                <DropdownMenuContent
                    align="end"
                    sideOffset={8}
                    className="w-72 p-0 overflow-hidden"
                >
                    {/* ── Profile header ─────────────────────────────────── */}
                    <div className="px-4 pt-4 pb-3 bg-muted/30 border-b border-border">
                        <div className="flex items-center gap-3">
                            <Avatar
                                name={profile?.name ?? "User"}
                                src={profile?.profilePicture ?? undefined}
                                size="md"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-foreground truncate">
                                    {profile?.name ?? "—"}
                                </p>
                                <p className="text-xs text-muted-foreground truncate mt-0.5">
                                    {profile?.email ?? "—"}
                                </p>
                                {roleStyle && (
                                    <span
                                        className={cn(
                                            "mt-1.5 inline-flex items-center text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border",
                                            roleStyle.className,
                                        )}
                                    >
                                        {roleStyle.label}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Navigation ─────────────────────────────────────── */}
                    <div className="p-1.5">
                        <p className="px-2 pt-1 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            Navigation
                        </p>

                        <DropdownMenuItem asChild>
                            <Link
                                href={dashboardHref}
                                className="flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer"
                            >
                                <span className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                                    <LayoutDashboard className="w-3.5 h-3.5 text-primary" />
                                </span>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">
                                        Dashboard
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                        Overview & analytics
                                    </p>
                                </div>
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                            <Link
                                href="/projects"
                                className="flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer"
                            >
                                <span className="w-7 h-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                                    <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                                </span>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">
                                        Browse Projects
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                        Find your next gig
                                    </p>
                                </div>
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                            <Link
                                href={contractsHref}
                                className="flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer"
                            >
                                <span className="w-7 h-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
                                </span>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">
                                        Contracts
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                        Active agreements
                                    </p>
                                </div>
                            </Link>
                        </DropdownMenuItem>
                    </div>

                    <DropdownMenuSeparator className="my-0" />

                    {/* ── Notifications ──────────────────────────────────── */}
                    <div className="p-1.5">
                        <div className="flex items-center justify-between px-2 pt-1 pb-1.5">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                <Bell className="w-3 h-3" />
                                Notifications
                            </p>
                            {unreadCount > 0 && (
                                <span className="text-[10px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full leading-none">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>

                        <div className="space-y-0.5">
                            {MOCK_NOTIFICATIONS.map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                />
                            ))}
                        </div>

                        <button
                            type="button"
                            className="w-full mt-1 text-[11px] font-semibold text-primary hover:text-primary/80 py-1.5 transition-colors text-center"
                        >
                            View all notifications
                        </button>
                    </div>

                    <DropdownMenuSeparator className="my-0" />

                    {/* ── Footer: Settings + Logout ──────────────────────── */}
                    <div className="p-1.5">
                        <DropdownMenuItem asChild>
                            <Link
                                href="/settings"
                                className="flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground"
                            >
                                <Settings className="w-4 h-4" />
                                Account Settings
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer text-sm font-medium text-destructive focus:text-destructive focus:bg-destructive/5"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign out
                        </DropdownMenuItem>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
