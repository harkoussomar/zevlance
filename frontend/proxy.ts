// ─── proxy.ts ─────────────────────────────────────────────────────────────────
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Role } from "./modules/shared/types";


function getSession(req: NextRequest): {
    hasSession: boolean;
    role: Role | null;
    emailVerified: boolean;
} {
    const hasSession = req.cookies.get("has_session")?.value === "true";
    const raw = req.cookies.get("user_role")?.value ?? "";
    const role =
        raw === "CLIENT" || raw === "FREELANCER" || raw === "ADMIN"
            ? (raw as Role)
            : null;
    const emailVerified = req.cookies.get("email_verified")?.value === "true";
    return { hasSession, role, emailVerified };
}

function redirectTo(path: string, req: NextRequest) {
    return NextResponse.redirect(new URL(path, req.url));
}

function roleDashboard(role: Role | null): string {
    if (role === "CLIENT") return "/client";
    if (role === "FREELANCER") return "/freelancer";
    if (role === "ADMIN") return "/admin";
    return "/login";
}

export function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const { hasSession, role, emailVerified } = getSession(req);

    // ── Verification page ─────────────────────────────────────────────────────
    if (pathname === "/verify-email") {
        if (hasSession && emailVerified)
            return redirectTo(roleDashboard(role), req);
        return NextResponse.next();
    }

    // ── Auth pages ────────────────────────────────────────────────────────────
    if (
        ["/login", "/register", "/forgot-password", "/reset-password"].includes(
            pathname,
        )
    ) {
        if (hasSession && role) return redirectTo(roleDashboard(role), req);
        return NextResponse.next();
    }

    // ── Hard block: logged in but not verified ────────────────────────────────
    if (
        hasSession &&
        !emailVerified &&
        (pathname.startsWith("/client") ||
            pathname.startsWith("/freelancer") ||
            pathname.startsWith("/admin") ||
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
        if (role !== "CLIENT") return redirectTo(roleDashboard(role), req);
        return NextResponse.next();
    }

    // ── Freelancer dashboard ──────────────────────────────────────────────────
    if (pathname === "/freelancer" || pathname.startsWith("/freelancer/")) {
        if (!hasSession) return redirectTo("/login", req);
        if (role !== "FREELANCER") return redirectTo(roleDashboard(role), req);
        return NextResponse.next();
    }

    // ── Admin dashboard ───────────────────────────────────────────────────────
    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
        if (!hasSession) return redirectTo("/login", req);
        if (role !== "ADMIN") return redirectTo(roleDashboard(role), req);
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};