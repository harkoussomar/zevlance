// ─── providers/AuthProvider.tsx ───────────────────────────────────────────────

"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import api from "../lib/axios";
import { AuthResponse } from "@/modules/auth/types";
import axios from "axios";

// ─── Props ────────────────────────────────────────────────────────────────────

interface AuthProviderProps {
    children: React.ReactNode;
    /**
     * Read server-side from the `has_session` cookie in the root layout.
     * Tells the provider whether to attempt session rehydration on mount.
     */
    initialHasSession: boolean;
}

// ─── AuthProvider ─────────────────────────────────────────────────────────────

export function AuthProvider({
    children,
    initialHasSession,
}: AuthProviderProps) {
    const login = useAuthStore((s) => s.login);
    const logout = useAuthStore((s) => s.logout);

    // fetchedRef prevents double-fetch in React StrictMode's double-invoke
    const fetchedRef = useRef(false);

    // isReady: false only while we're mid-flight on /auth/me.
    // For unauthenticated visitors (no cookie) we're immediately ready.
    const [isReady, setIsReady] = useState(!initialHasSession);

    useEffect(() => {
        if (!initialHasSession || fetchedRef.current) return;
        fetchedRef.current = true;

        let cancelled = false;

        api.get<AuthResponse>("/auth/me")
            .then(({ data }) => {
                if (!cancelled) {
                    login({
                        userId: data.userId,
                        email: data.email,
                        role: data.role,
                        name: data.name,
                    });
                }
            })
            .catch((error) => {
                if (!cancelled) {
                    // Type-safe check using Axios
                    if (
                        axios.isAxiosError(error) &&
                        error.response?.status === 401
                    ) {
                        logout();
                    } else {
                        // It's a network error / hot-reload stutter. Do nothing!
                        console.warn(
                            "Network error during /auth/me, keeping session active.",
                        );
                    }
                }
            })
            .finally(() => {
                if (!cancelled) setIsReady(true);
            });

        return () => {
            cancelled = true;
        };
    }, [initialHasSession, login, logout]);

    // Render a minimal full-screen loader instead of null to avoid a blank
    // white flash while the session is being verified for returning users.
    if (!isReady) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
        );
    }

    return <>{children}</>;
}
