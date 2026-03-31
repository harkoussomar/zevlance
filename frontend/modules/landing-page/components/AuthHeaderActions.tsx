"use client";

import Link from "next/link";
import { ArrowRight, LayoutDashboard, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { ROLE_REDIRECT } from "@/modules/auth/utils/role-redirection";

export default function AuthHeaderActions() {
    const { isAuthenticated, logout, role } = useAuthStore();

    return (
        <div className="flex items-center gap-3">
            {isAuthenticated ? (
                <>
                    {/* Logged In State */}
                    <Link
                        href={`${ROLE_REDIRECT[role!]}`}
                        className="hidden sm:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                    </Link>
                    <button
                        onClick={logout}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors duration-200"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        Logout
                    </button>
                </>
            ) : (
                <>
                    {/* Logged Out State */}
                    <Link
                        href="/login"
                        className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Sign in
                    </Link>
                    <Link
                        href="/register"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors duration-200"
                    >
                        Get started
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </>
            )}
        </div>
    );
}