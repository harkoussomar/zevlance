// ─── features/payment/services/payment.service.ts ────────────────────────────

import api from "@/modules/shared/lib/axios";
import type {
  CheckoutSessionResponse,
  StripeConnectResponse,
} from "../types";

/**
 * Create a Stripe Checkout session and return the redirect URL.
 * @role   CLIENT
 * @method POST /milestones/{id}/fund
 * @throws 409 — milestone not in PENDING status
 * @throws 422 — freelancer has not connected Stripe yet
 */
export function fundMilestone(
  milestoneId: string,
): Promise<CheckoutSessionResponse> {
  return api
    .post<CheckoutSessionResponse>(`/milestones/${milestoneId}/fund`)
    .then((r) => r.data);
}

/**
 * Refund a funded (but not yet submitted) milestone back to the client.
 * @role   CLIENT
 * @method POST /milestones/{id}/refund
 * @throws 409 — milestone not in FUNDED status, or deliverableUrl is set
 */
export function refundMilestone(milestoneId: string): Promise<void> {
  // `then(() => {})` is preferred over `then(() => undefined)` — the latter
  // silently discards future response envelope changes.
  return api.post(`/milestones/${milestoneId}/refund`).then(() => {});
}

/**
 * Start or retrieve a Stripe Connect onboarding link for the freelancer.
 * @role   FREELANCER
 * @method POST /stripe/connect/onboard
 */
export function startStripeOnboarding(): Promise<StripeConnectResponse> {
  return api
    .post<StripeConnectResponse>("/stripe/connect/onboard")
    .then((r) => r.data);
}

/**
 * Check whether the authenticated freelancer has completed Stripe Connect.
 * @role   FREELANCER
 * @method GET /stripe/connect/status
 * @returns true when onboarded and verified
 *
 * The API returns `{ connected: boolean }`. Extracting the scalar here keeps
 * all callers simple (`data: isOnboarded`) while the type boundary is explicit.
 */
export function getStripeConnectStatus(): Promise<boolean> {
  return api
    .get<boolean>("/stripe/connect/status")
    .then((r) => Boolean(r.data));
}