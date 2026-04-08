// ─── features/settings/components/StripeConnectSection.tsx ───────────────────

"use client";

import { Zap, CheckCircle2, ExternalLink, CreditCard } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/modules/shared/components/button";
import {  SkeletonCard } from "@/modules/shared/components/skeleton";
import { EmptyState } from "@/modules/shared/components/empty-state";
import {
    useStripeOnboarding,
    useStripeConnectStatus,
} from "@/modules/payment/hooks/usePayment";
import { useStripeReturnToast } from "@/modules/payment/hooks/useStripeReturnToast";
import type { StripeReturnIntent } from "@/app/(dashboard)/settings/page";

interface StripeConnectSectionProps {
    stripeIntent: StripeReturnIntent | null;
}

export function StripeConnectSection({
    stripeIntent,
}: StripeConnectSectionProps) {
    useStripeReturnToast(stripeIntent);

    const {
        data: isOnboarded,
        isPending,
        isError,
        error,
        refetch,
    } = useStripeConnectStatus();
    const { mutate: startOnboarding, isPending: starting } =
        useStripeOnboarding();

    // ─── Loading ──────────────────────────────────────────────────────────────

    if (isPending) return <SkeletonCard />;

    // ─── Error ────────────────────────────────────────────────────────────────

    if (isError) {
        return (
            <EmptyState
                icon={<CreditCard className="w-5 h-5" />}
                title="Could not load payment status"
                description={
                    error instanceof Error
                        ? error.message
                        : "Something went wrong. Please try again."
                }
                action={
                    <Button size="sm" onClick={() => refetch()}>
                        Retry
                    </Button>
                }
            />
        );
    }

    // ─── Onboarded ────────────────────────────────────────────────────────────

    if (isOnboarded) {
        return (
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/3 p-5">
                <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold text-foreground">
                                Payment Account Connected
                            </p>
                            <span className="inline-flex items-center text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25">
                                Verified
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            You&apos;ll receive payouts automatically when
                            clients approve your milestones. Funds are
                            transferred within 2 business days.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Not onboarded ────────────────────────────────────────────────────────

    return (
        <div className="rounded-xl border border-border p-5 space-y-4">
            <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground mb-1">
                        Get Paid for Your Work
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Connect your bank account via Stripe to receive
                        payments. Clients cannot fund milestones until you
                        complete this step.
                    </p>
                </div>
            </div>

            <Button
                size="sm"
                loading={starting}
                onClick={() =>
                    startOnboarding(undefined, {
                        onError: () =>
                            toast.error(
                                "Failed to start onboarding. Please try again.",
                            ),
                    })
                }
                className="w-full"
            >
                <ExternalLink className="w-3.5 h-3.5" />
                Connect Stripe Account
            </Button>
        </div>
    );
}
