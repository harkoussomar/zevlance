// ─── features/payment/hooks/useFundReturn.ts ─────────────────────────────────
//
// Mirrors the pattern established by `useStripeReturnToast` for onboarding.
//
// Why invalidate HERE and not in useFundMilestone.onSuccess?
//   Pre-invalidating before the Stripe redirect causes an unnecessary re-fetch
//   every time the tab regains focus, even when the user abandoned checkout.
//   Invalidating on return (driven by the ?funded= query param set by Stripe's
//   return_url) means the cache is only busted after a real payment attempt.
//
// Call this hook in the page/layout that serves Stripe's return_url.

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { milestoneKeys } from "@/modules/milestone/hooks/useMilestone";

/**
 * Handles the browser's return from Stripe Checkout.
 *
 * Reads `?funded=true|false` set by Stripe's `return_url`, shows a toast,
 * invalidates the milestone list for the contract, and strips the query param.
 *
 * @param contractId  - The contract whose milestone list to invalidate.
 * @param redirectTo  - URL to replace after handling (default: current pathname).
 *
 * @example
 * // In the contract detail page:
 * useFundReturn(contractId);
 */
export function useFundReturn(contractId: string, redirectTo?: string) {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const qc           = useQueryClient();
  const handled      = useRef(false);

  useEffect(() => {
    if (handled.current) return;

    const funded = searchParams.get("funded");
    if (!funded) return;

    // Guard against React 18 Strict Mode double-invocation in development.
    handled.current = true;

    if (funded === "true") {
      toast.success("Milestone funded — funds are held in escrow.");
      qc.invalidateQueries({ queryKey: milestoneKeys.list(contractId) });
    } else {
      toast.error("Payment was not completed. You can try again.");
    }

    // Strip the ?funded= param from the URL without adding a history entry.
    router.replace(redirectTo ?? window.location.pathname);
  }, [searchParams, contractId, qc, router, redirectTo]);
}