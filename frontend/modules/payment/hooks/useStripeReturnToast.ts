// ─── features/payment/hooks/useStripeReturnToast.ts ──────────────────────────
//
// Handles the one-time side-effect of showing a toast when the user returns
// from Stripe onboarding and cleaning the URL. Extracted from the component so
// it is independently testable and reusable.
//
// Design decisions:
//   • Accepts a typed intent — no magic string comparison inside the hook.
//   • useRef guard prevents the toast from double-firing in React 18 Strict Mode
//     (dev only) where effects intentionally mount → unmount → remount.
//   • router and intent are both stable across renders — dep array is honest,
//     no eslint suppression needed.

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { StripeReturnIntent } from "@/modules/settings/shared";

const MESSAGES: Record<StripeReturnIntent, { fn: typeof toast.success; text: string }> = {
  success: { fn: toast.success, text: "Your Stripe account is connected!" },
  refresh: { fn: toast.error,   text: "Onboarding expired. Please try again." },
};

/**
 * Shows a one-time toast based on the Stripe return intent and replaces the
 * current URL to strip the query param.
 *
 * @param intent     - Resolved on the server; null means no Stripe return.
 * @param redirectTo - Path to replace to (default: "/settings").
 *
 * @example
 * useStripeReturnToast(stripeIntent);
 */
export function useStripeReturnToast(
  intent: StripeReturnIntent | null,
  redirectTo = "/settings",
) {
  const router  = useRouter();
  const handled = useRef(false);

  useEffect(() => {
    if (!intent || handled.current) return;

    handled.current = true;

    const { fn, text } = MESSAGES[intent];
    fn(text);

    router.replace(redirectTo);
  }, [intent, router, redirectTo]);
}