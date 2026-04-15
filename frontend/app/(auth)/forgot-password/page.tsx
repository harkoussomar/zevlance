"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { Briefcase, ArrowRight, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { authService } from "@/modules/auth/services/auth.service";
import { parseApiError } from "@/modules/shared";
import { Alert } from "@/modules/shared/components/alert";
import { FormField } from "@/modules/shared/components/form-field";
import { InputField } from "@/modules/shared/components/input";
import { Button } from "@/modules/shared/components/button";
import { LeftDecorativePanel } from "@/modules/auth";
import z from "zod";

// ─── Schema ───────────────────────────────────────────────────────────────────

const forgotSchema = z.object({
  email: z.email("Please enter a valid email address"),
});

type ForgotSchemaType = z.infer<typeof forgotSchema>;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => { abortRef.current?.abort(); }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotSchemaType>({
    resolver: standardSchemaResolver(forgotSchema),
    mode: "onBlur",
  });

  const onSubmit = useCallback(async ({ email }: ForgotSchemaType) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setServerError(null);

    try {
      await authService.forgotPassword(email, controller.signal);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      // Surface unexpected errors (network, 5xx) but never 404 leaks
      setServerError(parseApiError(err, {}));
    } finally {
      setIsLoading(false);
      // Always show the success state — backend never reveals if email exists
      setSubmitted(true);
    }
  }, []);

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
            <span className="font-bold text-foreground">Zevlance</span>
          </div>

          {submitted ? (
            /* ── Success state ── */
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <span className="text-2xl">📧</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground">Check your email</h2>
              <p className="text-sm text-muted-foreground">
                If an account with that email exists, you&apos;ll receive a reset link shortly.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline mt-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </Link>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </Link>

              <h2 className="text-2xl font-bold text-foreground mb-1">
                Forgot your password?
              </h2>
              <p className="text-muted-foreground text-sm mb-8">
                Enter your email and we&apos;ll send you a reset link.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                {serverError && (
                  <Alert variant="destructive">{serverError}</Alert>
                )}

                <FormField label="Email address" required>
                  <InputField
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    error={errors.email?.message}
                    {...register("email")}
                  />
                </FormField>

                <Button type="submit" size="lg" loading={isLoading} className="w-full">
                  Send reset link
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