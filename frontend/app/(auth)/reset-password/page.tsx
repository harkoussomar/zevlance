"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Briefcase, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { authService } from "@/modules/auth/services/auth.service";
import { parseApiError } from "@/modules/shared";
import { Alert } from "@/modules/shared/components/alert";
import { FormField } from "@/modules/shared/components/form-field";
import { Input } from "@/modules/shared/components/input";
import { Button } from "@/modules/shared/components/button";
import { LeftDecorativePanel } from "@/modules/auth";

// ─── Schema ───────────────────────────────────────────────────────────────────
import { z } from "zod";

const resetSchema = z
    .object({
        newPassword: z
            .string()
            .min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type ResetSchemaType = z.infer<typeof resetSchema>;
// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token") ?? "";

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    useEffect(
        () => () => {
            abortRef.current?.abort();
        },
        [],
    );

    // Redirect to login 2 s after success
    useEffect(() => {
        if (!success) return;
        const id = setTimeout(() => router.push("/login"), 2000);
        return () => clearTimeout(id);
    }, [success, router]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetSchemaType>({
        resolver: standardSchemaResolver(resetSchema),
        mode: "onBlur",
    });

    const onSubmit = useCallback(
        async ({ newPassword }: ResetSchemaType) => {
            if (!token) {
                setServerError(
                    "Missing reset token. Please request a new link.",
                );
                return;
            }

            abortRef.current?.abort();
            const controller = new AbortController();
            abortRef.current = controller;

            setIsLoading(true);
            setServerError(null);

            try {
                await authService.resetPassword(
                    token,
                    newPassword,
                    controller.signal,
                );
                setSuccess(true);
            } catch (err) {
                if ((err as Error).name === "AbortError") return;
                setServerError(
                    parseApiError(err, {
                        400: "This reset link is invalid or has expired.",
                        404: "This reset link is invalid or has expired.",
                    }),
                );
            } finally {
                setIsLoading(false);
            }
        },
        [token],
    );

    return (
        <div className="min-h-screen bg-background flex">
            <LeftDecorativePanel />

            <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-sm">
                    {/* Mobile logo */}
                    <div className="flex items-center gap-2 mb-8 lg:hidden">
                        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                            <Briefcase className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <span className="font-bold text-foreground">
                            Freelance<span className="text-primary">Hub</span>
                        </span>
                    </div>

                    {success ? (
                        /* ── Success state ── */
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                                <span className="text-2xl">✅</span>
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">
                                Password updated!
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Your password has been reset successfully.
                                Redirecting you to sign in…
                            </p>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-1 text-sm text-primary font-semibold hover:underline"
                            >
                                Go to sign in now
                            </Link>
                        </div>
                    ) : (
                        /* ── Form state ── */
                        <>
                            <h2 className="text-2xl font-bold text-foreground mb-1">
                                Reset your password
                            </h2>
                            <p className="text-muted-foreground text-sm mb-8">
                                Choose a new password for your account.
                            </p>

                            <form
                                onSubmit={handleSubmit(onSubmit)}
                                className="space-y-4"
                                noValidate
                            >
                                {/* Token missing or invalid error */}
                                {(!token || serverError) && (
                                    <Alert variant="destructive">
                                        {serverError ?? "Missing reset token."}{" "}
                                        <Link
                                            href="/forgot-password"
                                            className="underline font-semibold"
                                        >
                                            Request a new link
                                        </Link>
                                    </Alert>
                                )}

                                <FormField label="New password" required>
                                    <Input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                        error={errors.newPassword?.message}
                                        endIcon={
                                            <button
                                                type="button"
                                                tabIndex={-1}
                                                onClick={() =>
                                                    setShowPassword((s) => !s)
                                                }
                                                aria-label={
                                                    showPassword
                                                        ? "Hide password"
                                                        : "Show password"
                                                }
                                                className="text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="w-4 h-4" />
                                                ) : (
                                                    <Eye className="w-4 h-4" />
                                                )}
                                            </button>
                                        }
                                        {...register("newPassword")}
                                    />
                                </FormField>

                                <FormField
                                    label="Confirm new password"
                                    required
                                >
                                    <Input
                                        type={showConfirm ? "text" : "password"}
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                        error={
                                            errors.confirmPassword?.message ??
                                            (
                                                errors as {
                                                    root?: { message?: string };
                                                }
                                            ).root?.message
                                        }
                                        endIcon={
                                            <button
                                                type="button"
                                                tabIndex={-1}
                                                onClick={() =>
                                                    setShowConfirm((s) => !s)
                                                }
                                                aria-label={
                                                    showConfirm
                                                        ? "Hide password"
                                                        : "Show password"
                                                }
                                                className="text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showConfirm ? (
                                                    <EyeOff className="w-4 h-4" />
                                                ) : (
                                                    <Eye className="w-4 h-4" />
                                                )}
                                            </button>
                                        }
                                        {...register("confirmPassword")}
                                    />
                                </FormField>

                                <p className="text-xs text-muted-foreground">
                                    Min 8 characters · one uppercase letter ·
                                    one number.
                                </p>

                                <Button
                                    type="submit"
                                    size="lg"
                                    loading={isLoading}
                                    disabled={!token}
                                    className="w-full"
                                >
                                    Reset password
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
