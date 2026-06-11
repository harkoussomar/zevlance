"use client";

import { formatDate } from "@/modules/shared";
import {
    useAdminUserDetail,
    useSuspendUser,
    useActivateUser,
} from "../hooks/useAdminUser";
import { Card } from "@/modules/shared/components/card";
import { ConfirmDialog } from "@/modules/shared/components/ConfirmDialog";
import {
    AlertCircle,
    Loader2,
    Mail,
    Phone,
    Shield,
    Activity,
    ShieldOff,
    ShieldCheck,
    CheckCircle2,
    XCircle,
    Star,
    FolderKanban,
    FileText,
    MessageSquare,
    CalendarDays,
    Clock,
    Gavel,
    Copy,
    Check,
} from "lucide-react";
import { useState, useCallback } from "react";
import type { UserDetailResponse } from "../types/admin.users.types";

type Props = { userId: string };

// ─── Shared primitive components ─────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            {children}
        </p>
    );
}

function InfoRow({
    icon: Icon,
    label,
    value,
    action,
}: {
    icon: React.ElementType;
    label: string;
    value: React.ReactNode;
    action?: React.ReactNode;
}) {
    return (
        <div className="flex items-start gap-3 py-2.5 border-b border-border/50 last:border-0">
            <Icon className="size-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <span className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">
                    {label}
                </span>
                <span className="text-sm font-medium text-foreground break-all">
                    {value}
                </span>
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
}

/** Displays a stat. Handles null/undefined → "—" gracefully. */
function StatCard({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: React.ReactNode;
}) {
    const display =
        value === null || value === undefined || value === "" ? "—" : value;
    return (
        <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-muted/50 border border-border/60">
            <div className="flex items-center gap-1.5 text-muted-foreground">
                <Icon className="size-3.5" />
                <span className="text-[10px] font-semibold uppercase tracking-widest">
                    {label}
                </span>
            </div>
            <span className="text-2xl font-bold text-foreground font-display tabular-nums">
                {display}
            </span>
        </div>
    );
}

/** Copy-to-clipboard button with transient checkmark feedback */
function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // clipboard not available — silently ignore
        }
    }, [text]);

    return (
        <button
            onClick={handleCopy}
            title="Copy to clipboard"
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
            {copied ? (
                <Check className="size-3.5 text-success" />
            ) : (
                <Copy className="size-3.5" />
            )}
        </button>
    );
}

/** Reason textarea for suspend/activate dialogs */
function ReasonTextarea({
    value,
    onChange,
    placeholder,
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
}) {
    return (
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="mt-3 w-full resize-none rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
        />
    );
}

const ROLE_CONFIG: Record<string, string> = {
    ADMIN: "bg-role-admin/10 text-role-admin border border-role-admin/25",
    CLIENT: "bg-role-client/10 text-role-client border border-role-client/25",
    FREELANCER:
        "bg-role-freelancer/10 text-role-freelancer border border-role-freelancer/25",
};

function RoleBadge({ role }: { role: string }) {
    const cls =
        ROLE_CONFIG[role] ?? "bg-muted text-muted-foreground border border-border";
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${cls}`}
        >
            <Shield className="size-3" />
            {role}
        </span>
    );
}

function VerificationBadge({
    verified,
    label,
}: {
    verified: boolean;
    label: string;
}) {
    return verified ? (
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase bg-success/10 text-success border border-success/25">
            <CheckCircle2 className="size-3" />
            {label} verified
        </span>
    ) : (
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase bg-muted text-muted-foreground border border-border">
            <XCircle className="size-3" />
            {label} unverified
        </span>
    );
}

function AccountStatusBadge({ active }: { active: boolean }) {
    return active ? (
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase bg-success/10 text-success border border-success/25">
            <span className="size-1.5 rounded-full bg-success animate-pulse" />
            Active
        </span>
    ) : (
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase bg-destructive/10 text-destructive border border-destructive/25">
            <span className="size-1.5 rounded-full bg-destructive" />
            Suspended
        </span>
    );
}

function UserInitialAvatar({
    email,
    role,
    size = "lg",
}: {
    email: string;
    role: string;
    size?: "sm" | "lg";
}) {
    const cls: Record<string, string> = {
        ADMIN: "bg-role-admin text-white",
        CLIENT: "bg-role-client text-white",
        FREELANCER: "bg-role-freelancer text-white",
    };
    const base = cls[role] ?? "bg-primary text-primary-foreground";
    const dim = size === "lg" ? "size-16 text-2xl" : "size-9 text-sm";
    return (
        <span
            className={`${dim} rounded-full flex items-center justify-center font-bold shrink-0 ${base}`}
        >
            {email.charAt(0).toUpperCase()}
        </span>
    );
}

/** Role-aware stats grid — CLIENT and FREELANCER show different metrics */
function StatsGrid({ user }: { user: UserDetailResponse }) {
    if (user.role === "CLIENT") {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <StatCard
                    icon={FolderKanban}
                    label="Projects posted"
                    value={user.totalProjects}
                />
                <StatCard
                    icon={FileText}
                    label="Contracts"
                    value={user.totalContracts}
                />
                <StatCard
                    icon={MessageSquare}
                    label="Reviews given"
                    value={user.totalReviews}
                />
            </div>
        );
    }

    if (user.role === "FREELANCER") {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard
                    icon={FolderKanban}
                    label="Projects won"
                    value={user.totalProjects}
                />
                <StatCard
                    icon={Gavel}
                    label="Total bids"
                    value={user.totalBids}
                />
                <StatCard
                    icon={FileText}
                    label="Contracts"
                    value={user.totalContracts}
                />
                <StatCard
                    icon={Star}
                    label="Avg rating"
                    value={
                        user.averageRating != null
                            ? user.averageRating.toFixed(1)
                            : null
                    }
                />
            </div>
        );
    }

    // ADMIN — minimal display
    return (
        <div className="py-6 text-center text-sm text-muted-foreground">
            Activity stats are not tracked for admin accounts.
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function UserDetailView({ userId }: Props) {
    const { data: user, isLoading, isError } = useAdminUserDetail(userId);
    const suspendMut = useSuspendUser();
    const activateMut = useActivateUser();

    const [confirmSuspend, setConfirmSuspend] = useState(false);
    const [confirmActivate, setConfirmActivate] = useState(false);
    const [suspendReason, setSuspendReason] = useState("");
    const [activateReason, setActivateReason] = useState("");

    function handleSuspendClose() {
        setConfirmSuspend(false);
        setSuspendReason("");
    }
    function handleActivateClose() {
        setConfirmActivate(false);
        setActivateReason("");
    }

    // ── Loading ──────────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <Card className="h-72 flex items-center justify-center gap-3 text-muted-foreground">
                <Loader2 className="size-5 animate-spin text-primary" />
                <span className="text-sm">Loading user profile…</span>
            </Card>
        );
    }

    if (isError || !user) {
        return (
            <Card className="h-72 flex flex-col items-center justify-center gap-3">
                <div className="size-10 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="size-5 text-destructive" />
                </div>
                <p className="text-sm font-semibold text-foreground">
                    Could not load user
                </p>
                <p className="text-xs text-muted-foreground">
                    The user may not exist or an error occurred.
                </p>
            </Card>
        );
    }

    const isBusy = suspendMut.isPending || activateMut.isPending;

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ── Left: profile card ── */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    {/* Identity */}
                    <Card className="p-6">
                        <div className="flex items-start gap-4 mb-5">
                            <UserInitialAvatar
                                email={user.email}
                                role={user.role}
                                size="lg"
                            />
                            <div className="flex flex-col gap-1.5 min-w-0">
                                <span className="text-base font-bold text-foreground font-display truncate">
                                    {user.name ?? user.email}
                                </span>
                                <span className="text-xs text-muted-foreground font-mono break-all">
                                    {user.email}
                                </span>
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                    <RoleBadge role={user.role} />
                                    <AccountStatusBadge active={user.active} />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <InfoRow
                                icon={Mail}
                                label="Email"
                                value={user.email}
                            />
                            {user.phone && (
                                <InfoRow
                                    icon={Phone}
                                    label="Phone"
                                    value={user.phone}
                                />
                            )}
                            <InfoRow
                                icon={CalendarDays}
                                label="Member since"
                                value={formatDate(user.joinedAt)}
                            />
                            <InfoRow
                                icon={Clock}
                                label="Last updated"
                                value={formatDate(user.updatedAt)}
                            />
                        </div>
                    </Card>

                    {/* Verification */}
                    <Card className="p-6">
                        <SectionTitle>Verification status</SectionTitle>
                        <div className="flex flex-col gap-2.5">
                            <VerificationBadge
                                verified={user.emailVerified}
                                label="Email"
                            />
                            {/* Extend here for ID / payment verification when available */}
                        </div>
                    </Card>

                    {/* Actions */}
                    {user.role !== "ADMIN" && (
                        <Card className="p-6">
                            <SectionTitle>Account actions</SectionTitle>
                            {user.active ? (
                                <button
                                    disabled={isBusy}
                                    onClick={() => setConfirmSuspend(true)}
                                    className="w-full h-9 flex items-center justify-center gap-2 rounded-lg text-[11px] font-semibold tracking-wide uppercase border border-destructive/30 text-destructive bg-destructive/5 hover:bg-destructive/10 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                                >
                                    {isBusy ? (
                                        <Loader2 className="size-3.5 animate-spin" />
                                    ) : (
                                        <ShieldOff className="size-3.5" />
                                    )}
                                    Suspend account
                                </button>
                            ) : (
                                <button
                                    disabled={isBusy}
                                    onClick={() => setConfirmActivate(true)}
                                    className="w-full h-9 flex items-center justify-center gap-2 rounded-lg text-[11px] font-semibold tracking-wide uppercase border border-success/30 text-success bg-success/5 hover:bg-success/10 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                                >
                                    {isBusy ? (
                                        <Loader2 className="size-3.5 animate-spin" />
                                    ) : (
                                        <ShieldCheck className="size-3.5" />
                                    )}
                                    Reactivate account
                                </button>
                            )}
                        </Card>
                    )}
                </div>

                {/* ── Right: stats + metadata ── */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Role-aware stats */}
                    <Card className="p-6">
                        <SectionTitle>Activity overview</SectionTitle>
                        <StatsGrid user={user} />
                    </Card>

                    {/* Linked payment methods placeholder */}
                    <Card className="p-6">
                        <SectionTitle>Linked payment methods</SectionTitle>
                        <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground">
                            <div className="size-10 rounded-xl bg-muted/60 flex items-center justify-center">
                                <Activity className="size-5 opacity-40" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-semibold text-foreground">
                                    No payment methods
                                </p>
                                <p className="text-xs mt-0.5">
                                    Payment data will appear here once the payments
                                    module is integrated.
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Account metadata */}
                    <Card className="p-6">
                        <SectionTitle>Account metadata</SectionTitle>
                        <div className="flex flex-col">
                            <InfoRow
                                icon={Shield}
                                label="User ID"
                                value={
                                    <span className="font-mono text-xs text-muted-foreground">
                                        {user.id}
                                    </span>
                                }
                                action={<CopyButton text={user.id} />}
                            />
                            <InfoRow
                                icon={Activity}
                                label="Account status"
                                value={<AccountStatusBadge active={user.active} />}
                            />
                            <InfoRow
                                icon={CheckCircle2}
                                label="Email verification"
                                value={
                                    <VerificationBadge
                                        verified={user.emailVerified}
                                        label="Email"
                                    />
                                }
                            />
                        </div>
                    </Card>
                </div>
            </div>

            {/* Suspend dialog */}
            <ConfirmDialog
                open={confirmSuspend}
                onCancel={handleSuspendClose}
                onConfirm={() => {
                    suspendMut.mutate({
                        id: userId,
                        reason: suspendReason.trim() || "Suspended by admin",
                    });
                    handleSuspendClose();
                }}
                title="Suspend this user"
                description={
                    <div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            This user will{" "}
                            <span className="text-foreground font-medium">
                                immediately lose platform access
                            </span>{" "}
                            until reactivated.
                        </p>
                        <ReasonTextarea
                            value={suspendReason}
                            onChange={setSuspendReason}
                            placeholder="Reason for suspension (optional)…"
                        />
                    </div>
                }
                confirmLabel="Suspend"
                variant="destructive"
            />

            {/* Activate dialog */}
            <ConfirmDialog
                open={confirmActivate}
                onCancel={handleActivateClose}
                onConfirm={() => {
                    activateMut.mutate({
                        id: userId,
                        reason: activateReason.trim() || "Reactivated by admin",
                    });
                    handleActivateClose();
                }}
                title="Reactivate this user"
                description={
                    <div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            This will{" "}
                            <span className="text-foreground font-medium">
                                restore full platform access
                            </span>{" "}
                            immediately.
                        </p>
                        <ReasonTextarea
                            value={activateReason}
                            onChange={setActivateReason}
                            placeholder="Reason for reactivation (optional)…"
                        />
                    </div>
                }
                confirmLabel="Activate"
                variant="default"
            />
        </>
    );
}