"use client";

import { useEffect,useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Menu, ArrowRight, LayoutDashboard, LogOut } from "lucide-react";

import { SmartAvatar } from "@/modules/shared/components/avatar";
import { NotificationBell } from "@/modules/notification";
import { useLogout } from "@/modules/auth/hooks/useLogout";
import { selectIsAuthenticated, useAuthStore } from "@/store/auth-store";
import { ROLE_REDIRECT, cn } from "@/modules/shared";
import AuthHeaderActions from "./AuthHeaderActions";
import { ThemeToggle } from "@/modules/shared/components/theme-toggle";
import { useMyBasicProfile } from "@/modules/profile/public";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
    href: string;
    label: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
    { href: "/projects", label: "Projects" },
    { href: "/talent", label: "Talent" },
    { href: "/contracts", label: "Contracts" },
];

// ─── Desktop nav link ─────────────────────────────────────────────────────────

interface NavLinkProps {
    href: string;
    children: React.ReactNode;
    isActive: boolean;
}

function DesktopNavLink({ href, children, isActive }: NavLinkProps) {
    return (
        <Link
            href={href}
            className={cn(
                "relative text-sm font-semibold pb-0.5",
                "transition-colors duration-100",
                "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-primary",
                "after:transition-transform after:duration-200 after:origin-left",
                isActive
                    ? "text-foreground after:scale-x-100"
                    : "text-muted-foreground hover:text-foreground after:scale-x-0 hover:after:scale-x-100",
            )}
        >
            {children}
        </Link>
    );
}

// ─── Logo ─────────────────────────────────────────────────────────────────────

function Logo() {
    return (
        <Link
            href="/"
            className="flex items-center gap-2 shrink-0 group focus-visible:outline-none"
            aria-label="Zevlance home"
        >
            <span
                className={cn(
                    "w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0",
                    "shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]",
                    "transition-all duration-200",
                    "group-hover:shadow-[0_0_0_4px_hsl(var(--primary)/0.18)]",
                )}
                aria-hidden
            >
                <span className="text-primary-foreground text-xs font-black tracking-tight leading-none">
                    Z
                </span>
            </span>
            <span className="font-display font-bold text-[17px] tracking-tight text-foreground leading-none">
                Zevlance
            </span>
        </Link>
    );
}

// ─── Hamburger ────────────────────────────────────────────────────────────────

interface HamburgerProps {
    isOpen: boolean;
    onToggle: () => void;
}

function Hamburger({ isOpen, onToggle }: HamburgerProps) {
    return (
        <button
            type="button"
            onClick={onToggle}
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-nav"
            className={cn(
                "md:hidden w-8 h-8 flex items-center justify-center rounded-lg",
                "text-muted-foreground hover:text-foreground",
                "hover:bg-muted transition-colors duration-100",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
        >
            <span className="relative w-4 h-4">
                <Menu
                    className={cn(
                        "absolute inset-0 w-4 h-4 transition-all duration-200",
                        isOpen ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100",
                    )}
                />
                <X
                    className={cn(
                        "absolute inset-0 w-4 h-4 transition-all duration-200",
                        isOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75",
                    )}
                />
            </span>
        </button>
    );
}

// ─── Mobile auth section ──────────────────────────────────────────────────────
// Separate from AuthHeaderActions — built specifically for the vertical
// mobile panel layout (full-width buttons, profile row, no dropdown).

function MobileAuthSection({ onClose }: { onClose: () => void }) {
    const isAuthenticated = useAuthStore(selectIsAuthenticated);
    const { data: profile } = useMyBasicProfile();
    const { handleLogout } = useLogout();

    const dashboardHref = profile?.role
        ? ROLE_REDIRECT[profile.role as keyof typeof ROLE_REDIRECT]
        : "/";

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col gap-2.5">
                {/* Theme toggle row */}
                <div className="flex items-center justify-between px-1 pb-1">
                    <span className="text-xs text-muted-foreground font-medium">
                        Appearance
                    </span>
                    <ThemeToggle />
                </div>

                <Link
                    href="/login"
                    onClick={onClose}
                    className={cn(
                        "w-full text-center text-sm font-semibold",
                        "px-4 py-3 rounded-xl",
                        "border border-border",
                        "text-muted-foreground hover:text-foreground hover:bg-muted",
                        "transition-all duration-150",
                    )}
                >
                    Sign in
                </Link>
                <Link
                    href="/register"
                    onClick={onClose}
                    className={cn(
                        "w-full text-center inline-flex items-center justify-center gap-1.5",
                        "text-sm font-bold",
                        "px-4 py-3 rounded-xl",
                        "bg-foreground text-background",
                        "hover:bg-foreground/90 active:scale-[0.98]",
                        "transition-all duration-150 shadow-sm",
                    )}
                >
                    Get started
                    <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-1.5">
            {/* Theme toggle row */}
            <div className="flex items-center justify-between px-3 py-2 mb-0.5">
                <span className="text-xs text-muted-foreground font-medium">
                    Appearance
                </span>
                <ThemeToggle />
            </div>

            {/* Profile identity row */}
            <Link
                href={dashboardHref}
                onClick={onClose}
                className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl",
                    "bg-muted/50 hover:bg-muted",
                    "transition-colors duration-150 group",
                )}
            >
                <SmartAvatar
                    name={profile?.name ?? "User"}
                    src={profile?.profilePicture ?? undefined}
                    size="sm"
                />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate leading-tight">
                        {profile?.name ?? "Account"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate leading-tight mt-0.5">
                        {profile?.email ?? ""}
                    </p>
                </div>
                <LayoutDashboard className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors shrink-0" />
            </Link>

            {/* Sign out */}
            <button
                type="button"
                onClick={() => { handleLogout(); onClose(); }}
                className={cn(
                    "w-full flex items-center gap-2 px-3 py-2.5 rounded-xl",
                    "text-sm font-medium text-muted-foreground",
                    "hover:text-destructive hover:bg-destructive/5",
                    "transition-all duration-150",
                )}
            >
                <LogOut className="w-4 h-4" />
                Sign out
            </button>
        </div>
    );
}

// ─── Mobile menu panel ────────────────────────────────────────────────────────

interface MobileMenuProps {
    isOpen: boolean;
    pathname: string;
    onClose: () => void;
}

function MobileMenu({ isOpen, pathname, onClose }: MobileMenuProps) {
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    return (
             <nav
                id="mobile-nav"
                aria-hidden={!isOpen}
                aria-label="Mobile navigation"
                className={cn(
                    "md:hidden fixed top-16 inset-x-0 z-[48]",
                    "bg-background border-b border-border",
                    "transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                    isOpen
                        ? "translate-y-0 opacity-100 pointer-events-auto"
                        : "-translate-y-3 opacity-0 pointer-events-none",
                )}
            >
                {/* Nav links */}
                <div className="px-6 pt-7 pb-2">
                    <p className="text-[10px] tracking-[0.2em] text-muted-foreground/40 font-mono uppercase mb-5">
                        Navigation
                    </p>

                    <ul className="divide-y divide-border/50">
                        {NAV_ITEMS.map((item, i) => {
                            const isActive =
                                pathname === item.href ||
                                pathname.startsWith(`${item.href}/`);

                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={onClose}
                                        style={{
                                            transitionDelay: isOpen
                                                ? `${i * 40 + 50}ms`
                                                : "0ms",
                                        }}
                                        className={cn(
                                            "flex items-center gap-3 py-4 group",
                                            "transition-all duration-[380ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                                            isOpen
                                                ? "translate-x-0 opacity-100"
                                                : "-translate-x-4 opacity-0",
                                        )}
                                    >
                                        <span className="text-[10px] font-mono text-muted-foreground/30 w-6 shrink-0 pt-0.5 select-none">
                                            {String(i + 1).padStart(2, "0")}
                                        </span>

                                        <span
                                            className={cn(
                                                "text-[22px] font-light tracking-tight flex-1 transition-colors duration-200",
                                                isActive
                                                    ? "text-foreground font-normal"
                                                    : "text-muted-foreground group-hover:text-foreground",
                                            )}
                                        >
                                            {item.label}
                                        </span>

                                        {isActive && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                        )}

                                        <span className="text-muted-foreground/20 text-sm -translate-x-1 transition-all duration-200 group-hover:translate-x-0 group-hover:text-muted-foreground/60">
                                            ›
                                        </span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Auth section — purpose-built for mobile, not reusing AuthHeaderActions */}
                <div
                    style={{
                        transitionDelay: isOpen
                            ? `${NAV_ITEMS.length * 40 + 80}ms`
                            : "0ms",
                    }}
                    className={cn(
                        "px-6 pt-4 pb-7 border-t border-border/50",
                        "transition-all duration-[380ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                        isOpen
                            ? "translate-y-0 opacity-100"
                            : "translate-y-3 opacity-0",
                    )}
                >
                    <MobileAuthSection onClose={onClose} />
                </div>
            </nav>
    );
}

// ─── Scroll-aware background ──────────────────────────────────────────────────

function useScrolled(threshold = 8) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > threshold);
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener("scroll", onScroll);
    }, [threshold]);

    return scrolled;
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

export function Navbar() {
    const pathname = usePathname();
    const scrolled = useScrolled();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [prevPathname, setPrevPathname] = useState(pathname);

    if (pathname !== prevPathname) {
        setPrevPathname(pathname);
        setMobileOpen(false);
    }

    useEffect(() => {
        if (!mobileOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setMobileOpen(false);
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [mobileOpen]);

    return (
        // No navRef + outside-click needed — backdrop onClick handles it
        <header
            className={cn(
                "fixed top-0 inset-x-0 z-50",
                "transition-all duration-200",
                scrolled
                    ? "border-b border-border bg-background/90 backdrop-blur-2xl shadow-sm"
                    : "border-b border-border/40 bg-background/70 backdrop-blur-xl",
            )}
        >
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
                <Logo />

                <div className="hidden md:flex items-center gap-8" role="navigation" aria-label="Main">
                    {NAV_ITEMS.map((item) => (
                        <DesktopNavLink
                            key={item.href}
                            href={item.href}
                            isActive={
                                pathname === item.href ||
                                pathname.startsWith(`${item.href}/`)
                            }
                        >
                            {item.label}
                        </DesktopNavLink>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    {/* Desktop auth — still uses AuthHeaderActions as-is */}
                    <div className="hidden md:flex">
                        <AuthHeaderActions />
                    </div>

                    <NotificationBell />

                    <Hamburger
                        isOpen={mobileOpen}
                        onToggle={() => setMobileOpen((v) => !v)}
                    />
                </div>
            </nav>

            <MobileMenu
                isOpen={mobileOpen}
                pathname={pathname}
                onClose={() => setMobileOpen(false)}
            />
        </header>
    );
}