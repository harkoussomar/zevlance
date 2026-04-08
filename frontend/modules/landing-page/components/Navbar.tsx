"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Menu } from "lucide-react";

import AuthHeaderActions from "./AuthHeaderActions";
import { cn } from "@/modules/shared";

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

// ─── Sub-components ───────────────────────────────────────────────────────────

interface NavLinkProps {
    href: string;
    children: React.ReactNode;
    isActive: boolean;
    onClick?: () => void;
}

/** Desktop nav link with an animated underline accent. */
function DesktopNavLink({ href, children, isActive }: NavLinkProps) {
    return (
        <Link
            href={href}
            className={cn(
                "relative text-sm font-semibold pb-0.5",
                "transition-colors duration-100",
                // Underline stroke
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

/** Mobile menu link — full-width with active indicator. */
function MobileNavLink({ href, children, isActive, onClick }: NavLinkProps) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl",
                "text-sm font-semibold",
                "transition-colors duration-100",
                isActive
                    ? "bg-primary/8 text-primary"
                    : "text-foreground hover:bg-muted",
            )}
        >
            {/* Active indicator bar */}
            <span
                className={cn(
                    "w-1 h-5 rounded-full transition-all duration-200",
                    isActive ? "bg-primary" : "bg-transparent",
                )}
            />
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
            aria-label="FreelanceHub home"
        >
            {/* Geometric mark */}
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
                    FH
                </span>
            </span>

            {/* Wordmark — Bricolage Grotesque via --font-display */}
            <span className="font-display font-bold text-[17px] tracking-tight text-foreground leading-none">
                Freelance<span className="text-primary">Hub</span>
            </span>
        </Link>
    );
}

// ─── Hamburger button ─────────────────────────────────────────────────────────

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
            {/* Animated X / Menu */}
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

// ─── Mobile menu panel ────────────────────────────────────────────────────────

interface MobileMenuProps {
    isOpen: boolean;
    pathname: string;
    onClose: () => void;
}

function MobileMenu({ isOpen, pathname, onClose }: MobileMenuProps) {
    return (
        <div
            id="mobile-nav"
            aria-hidden={!isOpen}
            className={cn(
                "md:hidden absolute top-full inset-x-0 z-40",
                "bg-background/98 backdrop-blur-xl",
                "border-b border-border",
                "overflow-hidden",
                "transition-all duration-300 ease-in-out",
                isOpen ? "max-h-105 opacity-100" : "max-h-0 opacity-0",
            )}
        >
            <div className="px-4 pt-3 pb-5 space-y-1">
                {NAV_ITEMS.map((item) => (
                    <MobileNavLink
                        key={item.href}
                        href={item.href}
                        isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                        onClick={onClose}
                    >
                        {item.label}
                    </MobileNavLink>
                ))}

                {/* Divider */}
                <div className="h-px bg-border my-3" />

                {/* Auth actions replicated for mobile */}
                <div className="px-1">
                    <AuthHeaderActions />
                </div>
            </div>
        </div>
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
    const navRef = useRef<HTMLElement>(null);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    // Close on Escape key
    useEffect(() => {
        if (!mobileOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setMobileOpen(false);
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [mobileOpen]);

    // Close on outside click
    useEffect(() => {
        if (!mobileOpen) return;
        const onPointer = (e: PointerEvent) => {
            if (navRef.current && !navRef.current.contains(e.target as Node)) {
                setMobileOpen(false);
            }
        };
        document.addEventListener("pointerdown", onPointer);
        return () => document.removeEventListener("pointerdown", onPointer);
    }, [mobileOpen]);

    return (
        <header
            ref={navRef}
            className={cn(
                "fixed top-0 inset-x-0 z-50",
                "transition-all duration-200",
                // Heighten the shadow + border opacity when scrolled
                scrolled
                    ? "border-b border-border bg-background/90 backdrop-blur-2xl shadow-sm"
                    : "border-b border-border/40 bg-background/70 backdrop-blur-xl",
            )}
        >
            {/* ── Main bar ─────────────────────────────────────────────── */}
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
                {/* Left: logo */}
                <Logo />

                {/* Centre: desktop nav links */}
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

                {/* Right: actions */}
                <div className="flex items-center gap-2">
                    {/* Desktop auth actions */}
                    <div className="hidden md:flex">
                        <AuthHeaderActions />
                    </div>

                    {/* Mobile hamburger (auth inside mobile menu) */}
                    <Hamburger
                        isOpen={mobileOpen}
                        onToggle={() => setMobileOpen((v) => !v)}
                    />
                </div>
            </nav>

            {/* ── Mobile slide-down menu ────────────────────────────────── */}
            <MobileMenu
                isOpen={mobileOpen}
                pathname={pathname}
                onClose={() => setMobileOpen(false)}
            />
        </header>
    );
}