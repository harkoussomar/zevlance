// ─── features/payment/hooks/usePayment.ts ────────────────────────────────────

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import * as paymentApi from "../services/payment.service";
import { isSafeStripeUrl } from "../utils/stripe-url";
import { stripeKeys } from "../utils/stripe-keys";
import { milestoneKeys } from "@/modules/milestone/shared";

// ─── Client: Fund a milestone ─────────────────────────────────────────────────

/**
 * Creates a Stripe Checkout session and immediately redirects the browser.
 *
 * Cache invalidation intentionally happens **after** returning from Stripe,
 * driven by the `?funded=` query param — see `useFundReturn`. Invalidating
 * before redirect causes an unnecessary re-fetch when the user abandons
 * the checkout and returns to the page.
 *
 * `retry: 0` is required on all money-moving mutations to prevent React Query's
 * default retry logic from submitting duplicate payment requests.
 *
 * @example
 * const { mutate: fundMilestone, isPending } = useFundMilestone(contractId);
 * fundMilestone(milestoneId);
 */
export function useFundMilestone(_contractId: string) {
  return useMutation({
    retry: 0,
    mutationFn: (milestoneId: string) => paymentApi.fundMilestone(milestoneId),
    onError: (error) => {
      // Default handler — prevents silent failures when the call site only
      // wires `onSuccess`. Call sites may override via mutate(id, { onError }).
      console.error("[useFundMilestone]", error);
    },
    onSuccess: (data) => {
      if (!isSafeStripeUrl(data.checkoutUrl)) {
        // Never redirect to an untrusted URL returned by the API.
        toast.error("Received an invalid payment URL. Please try again.");
        console.error("[useFundMilestone] Blocked unsafe redirect:", data.checkoutUrl);
        return;
      }
      window.location.href = data.checkoutUrl;
    },
  });
}

// ─── Client: Refund a funded milestone ───────────────────────────────────────

/**
 * Refund a milestone that is FUNDED and has no submitted deliverable.
 *
 * `retry: 0` prevents accidental double-refunds on transient network errors.
 *
 * @example
 * const { mutate: refundMilestone, isPending } = useRefundMilestone(contractId);
 * refundMilestone(milestoneId);
 */
export function useRefundMilestone(contractId: string) {
  const qc = useQueryClient();

  return useMutation({
    retry: 0,
    mutationFn: (milestoneId: string) => paymentApi.refundMilestone(milestoneId),
    onError: (error) => {
      console.error("[useRefundMilestone]", error);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: milestoneKeys.list(contractId) });
    },
  });
}

// ─── Freelancer: Stripe Connect onboarding ───────────────────────────────────

/**
 * Start Stripe Connect onboarding. Redirects to Stripe if not yet onboarded.
 * If already onboarded the caller receives `alreadyOnboarded: true` with no
 * redirect — show a success state instead.
 *
 * `retry: 0` prevents re-initiating onboarding on transient network errors.
 *
 * @example
 * const { mutate: startOnboarding, isPending } = useStripeOnboarding();
 * startOnboarding(undefined, { onError: () => toast.error("…") });
 */
export function useStripeOnboarding() {
  return useMutation({
    retry: 0,
    mutationFn: () => paymentApi.startStripeOnboarding(),
    onError: (error) => {
      console.error("[useStripeOnboarding]", error);
    },
    onSuccess: (data) => {
      if (data.alreadyOnboarded || !data.onboardingUrl) return;

      if (!isSafeStripeUrl(data.onboardingUrl)) {
        toast.error("Received an invalid onboarding URL. Please try again.");
        console.error("[useStripeOnboarding] Blocked unsafe redirect:", data.onboardingUrl);
        return;
      }

      window.location.href = data.onboardingUrl;
    },
  });
}

// ─── Freelancer: Check Stripe Connect status ─────────────────────────────────

/**
 * Poll whether the freelancer has a verified Stripe Connect account.
 *
 * `staleTime: 5 min` — the connect status is stable within a session.
 * Without it, React Query re-fetches on every window focus event.
 *
 * Query key managed by `stripeKeys` factory — no magic strings at call sites.
 *
 * @example
 * const { data: isOnboarded } = useStripeConnectStatus();
 */
export function useStripeConnectStatus() {
  return useQuery({
    queryKey: stripeKeys.connectStatus(),
    queryFn: () => paymentApi.getStripeConnectStatus(),
  });
}