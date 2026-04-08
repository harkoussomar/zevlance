"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/modules/shared";

/**
 * ThemeToggle
 *
 * A single icon button that cycles between light and dark themes.
 * No dropdown — one click, instant switch. Smooth icon crossfade via CSS.
 * Follows the design system's motion tokens (fast: 100ms, base: 200ms).
 */
export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    const toggle = () => setTheme(isDark ? "light" : "dark");

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className={cn(
                "relative w-8 h-8 rounded-lg",
                "flex items-center justify-center",
                "text-muted-foreground hover:text-foreground",
                "hover:bg-muted",
                "transition-colors duration-100",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            )}
        >
            {/* Sun — shown in light mode */}
            <Sun
                className={cn(
                    "absolute w-[1.05rem] h-[1.05rem]",
                    "transition-all duration-200 ease-in-out",
                    isDark
                        ? "opacity-0 scale-50 rotate-90 pointer-events-none"
                        : "opacity-100 scale-100 rotate-0",
                )}
                aria-hidden
            />

            {/* Moon — shown in dark mode */}
            <Moon
                className={cn(
                    "absolute w-[1.05rem] h-[1.05rem]",
                    "transition-all duration-200 ease-in-out",
                    isDark
                        ? "opacity-100 scale-100 rotate-0"
                        : "opacity-0 scale-50 -rotate-90 pointer-events-none",
                )}
                aria-hidden
            />
        </button>
    );
}