"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Briefcase, ArrowLeft, RefreshCw } from "lucide-react";
import { LeftDecorativePanel, useLogout } from "@/modules/auth";
import { Button } from "@/modules/shared/components/button";
import { Alert } from "@/modules/shared/components/alert";
import api from "@/modules/shared/lib/axios";
import { parseApiError } from "@/modules/shared";

type Status = "pending" | "verifying" | "success" | "error";

export default function VerifyEmailPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const {handleLogout} = useLogout();
  const token        = searchParams.get("token") ?? "";

  const [status,       setStatus]       = useState<Status>(token ? "verifying" : "pending");
  const [serverError,  setServerError]  = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent,   setResendSent]   = useState(false);
  const didRun = useRef(false);

  // ── Only verify if a token is present in the URL ──────────────────────────
  useEffect(() => {
    if (!token) return;                 // no token → stay on "pending" state
    if (didRun.current) return;
    didRun.current = true;

    api.post(`/auth/verify-email?token=${token}`)
      .then(() => setStatus("success"))
      .catch((err) => {
        setServerError(
          parseApiError(err, {
            400: "This verification link is invalid or has already been used.",
            404: "This verification link is invalid or has already been used.",
          })
        );
        setStatus("error");
      });
  }, [token]);

  // ── Redirect after success ────────────────────────────────────────────────
  useEffect(() => {
    if (status !== "success") return;
    const id = setTimeout(() => router.replace("/login"), 3000);
    return () => clearTimeout(id);
  }, [status, router]);

  // ── Resend handler ────────────────────────────────────────────────────────
  const handleResend = async () => {
    setResendLoading(true);
    try {
      await api.post("/auth/resend-verification");
      setResendSent(true);
    } catch {
      // user may not be authenticated — silently ignore
    } finally {
      setResendLoading(false);
    }
  };



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

          {/* ── Pending: just registered, waiting for email ── */}
          {status === "pending" && (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                <span className="text-2xl">📧</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Check your inbox
              </h2>
              <p className="text-sm text-muted-foreground">
                We sent a verification link to your email address.
                Click the link to activate your account.
              </p>
              <p className="text-xs text-muted-foreground">
                Didn&apos;t receive it? Check your spam folder or resend below.
              </p>

              {resendSent ? (
                <Alert variant="default">
                  Verification email resent! Check your inbox.
                </Alert>
              ) : (
                <Button
                  size="lg"
                  variant="outline"
                  loading={resendLoading}
                  onClick={handleResend}
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4" />
                  Resend verification email
                </Button>
              )}

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mt-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </button>
            </div>
          )}

          {/* ── Verifying: token in URL, request in flight ── */}
          {status === "verifying" && (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4 animate-pulse">
                <span className="text-2xl">📧</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Verifying your email…
              </h2>
              <p className="text-sm text-muted-foreground">
                Please wait while we confirm your email address.
              </p>
            </div>
          )}

          {/* ── Success ── */}
          {status === "success" && (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Email verified!
              </h2>
              <p className="text-sm text-muted-foreground">
                Your account is now active. Redirecting you to sign in…
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Go to sign in now
              </Link>
            </div>
          )}

          {/* ── Error: bad/expired token ── */}
          {status === "error" && (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                <span className="text-2xl">❌</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Verification failed
              </h2>
              <p className="text-sm text-muted-foreground">
                This link may have expired or already been used.
              </p>

              {serverError && (
                <Alert variant="destructive">{serverError}</Alert>
              )}

              {resendSent ? (
                <Alert variant="default">
                  A new verification email has been sent. Check your inbox.
                </Alert>
              ) : (
                <Button
                  size="lg"
                  loading={resendLoading}
                  onClick={handleResend}
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4" />
                  Resend verification email
                </Button>
              )}

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}