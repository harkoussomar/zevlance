// ─── proxy.ts ─────────────────────────────────────────────────────────────────
//
// Next.js 16: middleware.ts is renamed to proxy.ts, exported function is
// renamed from `middleware` to `proxy`. Runs on the Node.js runtime (not Edge).
// Place this file at the project root alongside package.json.
//
// Cookie strategy (set by Spring Boot AuthController):
//   has_session  — non-httpOnly boolean flag; "true" when a JWT exists
//   user_role    — non-httpOnly "CLIENT" | "FREELANCER"; read here for RBAC
//   jwt          — httpOnly; never readable here, carried automatically by axios
//
// URL note: route groups (auth), (dashboard), (public) are filesystem-only.
// They do NOT appear in real URLs. The actual paths are:
//   /login, /register
//   /client/*, /freelancer/*, /settings
//   /freelancers/*, /projects

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = "CLIENT" | "FREELANCER";

// ─── Cookie helpers ───────────────────────────────────────────────────────────

function getSession(req: NextRequest): {
    hasSession: boolean;
    role: Role | null;
    emailVerified: boolean; // ← add
} {
    const hasSession = req.cookies.get("has_session")?.value === "true";
    const raw = req.cookies.get("user_role")?.value ?? "";
    const role =
        raw === "CLIENT" || raw === "FREELANCER" ? (raw as Role) : null;
    const emailVerified = req.cookies.get("email_verified")?.value === "true"; // ← add
    return { hasSession, role, emailVerified };
}

function redirectTo(path: string, req: NextRequest) {
    return NextResponse.redirect(new URL(path, req.url));
}

function roleDashboard(role: Role | null): string {
    if (role === "CLIENT") return "/client";
    if (role === "FREELANCER") return "/freelancer";
    return "/login";
}

// ─── Proxy ────────────────────────────────────────────────────────────────────

export function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const { hasSession, role, emailVerified } = getSession(req);

    // ── Verification page ─────────────────────────────────────────────────────
    if (pathname === "/verify-email") {
        // Already verified → send to dashboard
        if (hasSession && emailVerified)
            return redirectTo(roleDashboard(role), req);
        return NextResponse.next();
    }

    // ── Auth pages (/login, /register, /forgot-password, /reset-password) ─────
    if (
        ["/login", "/register", "/forgot-password", "/reset-password"].includes(
            pathname,
        )
    ) {
        if (hasSession && role) return redirectTo(roleDashboard(role), req);
        return NextResponse.next();
    }

    if (pathname === "/verify-email") {
        return NextResponse.next();
    }

    // ── Hard block: logged in but not verified ────────────────────────────────
    if (
        hasSession &&
        !emailVerified &&
        (pathname.startsWith("/client") ||
            pathname.startsWith("/freelancer") ||
            pathname === "/settings")
    ) {
        return redirectTo("/verify-email", req);
    }

    // ── Settings ──────────────────────────────────────────────────────────────
    if (pathname === "/settings") {
        if (!hasSession) return redirectTo("/login", req);
        return NextResponse.next();
    }

    // ── Client dashboard ──────────────────────────────────────────────────────
    if (pathname === "/client" || pathname.startsWith("/client/")) {
        if (!hasSession) return redirectTo("/login", req);
        if (role !== "CLIENT") return redirectTo("/freelancer", req);
        return NextResponse.next();
    }

    // ── Freelancer dashboard ──────────────────────────────────────────────────
    if (pathname === "/freelancer" || pathname.startsWith("/freelancer/")) {
        if (!hasSession) return redirectTo("/login", req);
        if (role !== "FREELANCER") return redirectTo("/client", req);
        return NextResponse.next();
    }

    return NextResponse.next();
}

// ─── Matcher ──────────────────────────────────────────────────────────────────
//
// Exclude Next.js internals and static assets so proxy doesn't run on every
// image request, font, or build chunk.

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
