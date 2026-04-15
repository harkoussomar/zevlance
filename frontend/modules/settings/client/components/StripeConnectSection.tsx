// ─── features/settings/components/StripeConnectSection.tsx ───────────────────

"use client";

import { Zap, CheckCircle2, ExternalLink, CreditCard, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/modules/shared/components/button";
import { Skeleton } from "@/modules/shared/components/skeleton";
import { Alert, AlertDescription } from "@/modules/shared/components/alert";
import {
  useStripeOnboarding,
  useStripeConnectStatus,
} from "@/modules/payment/hooks/usePayment";
import { useStripeReturnToast } from "@/modules/payment/hooks/useStripeReturnToast";
import type { StripeReturnIntent } from "../../shared";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StripeConnectSectionProps {
  stripeIntent: StripeReturnIntent | null;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="h-9 w-full rounded-lg" />
    </div>
  );
}

function ConnectedState() {
  return (
    <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-foreground">
              Payment Account Connected
            </p>
            <span className="inline-flex items-center rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Verified
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            You&apos;ll receive payouts automatically when clients approve
            milestones. Funds are transferred within 2 business days.
          </p>
        </div>
      </div>
    </div>
  );
}

interface NotConnectedStateProps {
  onConnect: () => void;
  isConnecting: boolean;
}

function NotConnectedState({ onConnect, isConnecting }: NotConnectedStateProps) {
  return (
    <div className="space-y-4">
      {/* Info card */}
      <div className="rounded-xl border border-border bg-muted/30 p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted ring-1 ring-border">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">
              Set up payouts
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Connect your bank account via Stripe to receive milestone
              payments. Clients cannot fund milestones until this is complete.
            </p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <ol className="space-y-2.5 text-xs text-muted-foreground">
        {[
          "Click the button below to open Stripe",
          "Complete your identity & bank details",
          "Return here — your account links automatically",
        ].map((step, i) => (
          <li key={step} className="flex items-start gap-2.5">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-foreground ring-1 ring-border mt-px">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>

      <Button
        size="sm"
        loading={isConnecting}
        onClick={onConnect}
        className="w-full"
      >
        <Zap className="h-3.5 w-3.5" />
        Connect via Stripe
        <ExternalLink className="h-3.5 w-3.5 ml-1 opacity-60" />
      </Button>

      <p className="text-center text-[11px] text-muted-foreground">
        Powered by Stripe · Bank-grade security
      </p>
    </div>
  );
}

// ─── StripeConnectSection ─────────────────────────────────────────────────────

export function StripeConnectSection({ stripeIntent }: StripeConnectSectionProps) {
  useStripeReturnToast(stripeIntent);

  const {
    data: isOnboarded,
    isPending,
    isError,
    error,
    refetch,
  } = useStripeConnectStatus();

  const { mutate: startOnboarding, isPending: isConnecting } = useStripeOnboarding();

  // ─── Loading ───────────────────────────────────────────────────────────────

  if (isPending) return <StatusSkeleton />;

  // ─── Error ─────────────────────────────────────────────────────────────────

  if (isError) {
    return (
      <div className="space-y-3">
        <Alert variant="destructive">
          <AlertDescription className="text-sm">
            {error instanceof Error
              ? error.message
              : "Could not load payment status."}
          </AlertDescription>
        </Alert>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="gap-2"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </Button>
      </div>
    );
  }

  // ─── Onboarded ─────────────────────────────────────────────────────────────

  if (isOnboarded) return <ConnectedState />;

  // ─── Not onboarded ─────────────────────────────────────────────────────────

  return (
    <NotConnectedState
      isConnecting={isConnecting}
      onConnect={() =>
        startOnboarding(undefined, {
          onError: () =>
            toast.error("Failed to start onboarding. Please try again."),
        })
      }
    />
  );
}