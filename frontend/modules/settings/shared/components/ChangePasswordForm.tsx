// ─── features/settings/components/ChangePasswordForm.tsx ──────────────────────

"use client";

import { useState, useId } from "react";
import {
    Lock,
    Eye,
    EyeOff,
    Loader2,
    ShieldCheck,
    AlertCircle,
} from "lucide-react";

import { cn } from "@/modules/shared";
import { Input } from "@/modules/shared/components/input";
import { Label } from "@/modules/shared/components/label";
import { Button } from "@/modules/shared/components/button";
import { Alert, AlertDescription } from "@/modules/shared/components/alert";
import { useChangePassword } from "../hooks/useChangePassword";

// ─── Constants ────────────────────────────────────────────────────────────────

const MIN_PASSWORD_LENGTH = 8;

const STRENGTH_CONFIG = [
    { label: "Very weak", colorClass: "bg-destructive" },
    { label: "Weak", colorClass: "bg-orange-500" },
    { label: "Fair", colorClass: "bg-amber-400" },
    { label: "Good", colorClass: "bg-yellow-400" },
    { label: "Strong", colorClass: "bg-emerald-400" },
    { label: "Very strong", colorClass: "bg-emerald-500" },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStrengthScore(pw: string): number {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score; // 0-5
}

function extractErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return "Failed to change password. Please try again.";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StrengthMeter({ password }: { password: string }) {
    if (!password) return null;

    const score = getStrengthScore(password);
    const { label, colorClass } = STRENGTH_CONFIG[score];

    return (
        <div className="mt-2.5 space-y-1.5">
            <div
                className="flex gap-1"
                role="progressbar"
                aria-valuenow={score}
                aria-valuemax={5}
            >
                {Array.from({ length: 5 }).map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            "h-1 flex-1 rounded-full transition-all duration-300",
                            i < score ? colorClass : "bg-border",
                        )}
                    />
                ))}
            </div>
            <p className="text-xs text-muted-foreground">{label}</p>
        </div>
    );
}

interface PasswordInputProps {
    id: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    autoComplete?: string;
}

function PasswordInput({
    id,
    value,
    onChange,
    placeholder,
    autoComplete = "off",
}: PasswordInputProps) {
    const [show, setShow] = useState(false);

    return (
        <div className="relative">
            <Input
                id={id}
                type={show ? "text" : "password"}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                autoComplete={autoComplete}
                className="pr-10"
            />
            <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
            >
                {show ? (
                    <EyeOff className="h-4 w-4" />
                ) : (
                    <Eye className="h-4 w-4" />
                )}
            </button>
        </div>
    );
}

// ─── Success state ────────────────────────────────────────────────────────────

function SuccessState({ onReset }: { onReset: () => void }) {
    return (
        <div className="flex flex-col items-center gap-4 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20">
                <ShieldCheck className="h-7 w-7 text-emerald-500" />
            </div>
            <div className="space-y-1">
                <p className="font-semibold text-foreground">
                    Password updated
                </p>
                <p className="text-sm text-muted-foreground">
                    Your new password is active from your next login.
                </p>
            </div>
            <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="mt-1 text-xs"
            >
                Change again
            </Button>
        </div>
    );
}

// ─── ChangePasswordForm ───────────────────────────────────────────────────────

export function ChangePasswordForm() {
    const uid = useId();
    const mutation = useChangePassword();

    const [current, setCurrent] = useState("");
    const [next, setNext] = useState("");
    const [confirm, setConfirm] = useState("");
    const [done, setDone] = useState(false);

    // ─── Validation ───────────────────────────────────────────────────────────

    const isMismatch = confirm.length > 0 && next !== confirm;
    const isTooShort = next.length > 0 && next.length < MIN_PASSWORD_LENGTH;
    const isSameAsCur = next.length > 0 && next === current;

    const canSubmit =
        current.length > 0 &&
        next.length >= MIN_PASSWORD_LENGTH &&
        next === confirm &&
        !isSameAsCur &&
        !mutation.isPending;

    const serverError = mutation.isError
        ? extractErrorMessage(mutation.error)
        : null;

    // ─── Handlers ─────────────────────────────────────────────────────────────

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!canSubmit) return;

        try {
            await mutation.mutateAsync({
                currentPassword: current,
                newPassword: next,
            });
            setCurrent("");
            setNext("");
            setConfirm("");
            setDone(true);
        } catch {
            // Error is surfaced via mutation.isError
        }
    }

    function handleReset() {
        setDone(false);
        mutation.reset();
    }

    // ─── Render ───────────────────────────────────────────────────────────────

    if (done) return <SuccessState onReset={handleReset} />;

    return (
        <form onSubmit={handleSubmit} className="space-y-5 max-w-sm">
            {/* Current password */}
            <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    <Label
                        htmlFor={`${uid}-current`}
                        className="text-sm font-medium"
                    >
                        Current password
                    </Label>
                </div>
                <PasswordInput
                    id={`${uid}-current`}
                    value={current}
                    onChange={setCurrent}
                    placeholder="Your current password"
                    autoComplete="current-password"
                />
            </div>

            <div className="h-px bg-border" />

            {/* New password */}
            <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    <Label
                        htmlFor={`${uid}-new`}
                        className="text-sm font-medium"
                    >
                        New password
                    </Label>
                </div>
                <PasswordInput
                    id={`${uid}-new`}
                    value={next}
                    onChange={setNext}
                    placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
                    autoComplete="new-password"
                />
                {isTooShort && (
                    <p className="flex items-center gap-1.5 text-xs text-destructive">
                        <AlertCircle className="h-3 w-3" />
                        Must be at least {MIN_PASSWORD_LENGTH} characters.
                    </p>
                )}
                {isSameAsCur && (
                    <p className="flex items-center gap-1.5 text-xs text-destructive">
                        <AlertCircle className="h-3 w-3" />
                        New password must differ from current.
                    </p>
                )}
                <StrengthMeter password={next} />
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
                <Label
                    htmlFor={`${uid}-confirm`}
                    className="text-sm font-medium"
                >
                    Confirm new password
                </Label>
                <PasswordInput
                    id={`${uid}-confirm`}
                    value={confirm}
                    onChange={setConfirm}
                    placeholder="Repeat your new password"
                    autoComplete="new-password"
                />
                {isMismatch && (
                    <p className="flex items-center gap-1.5 text-xs text-destructive">
                        <AlertCircle className="h-3 w-3" />
                        Passwords do not match.
                    </p>
                )}
            </div>

            {/* Server error */}
            {serverError && (
                <Alert variant="destructive" className="py-3">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                        {serverError}
                    </AlertDescription>
                </Alert>
            )}

            <Button type="submit" disabled={!canSubmit} className="w-full">
                {mutation.isPending ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Updating…
                    </>
                ) : (
                    "Update password"
                )}
            </Button>
        </form>
    );
}
