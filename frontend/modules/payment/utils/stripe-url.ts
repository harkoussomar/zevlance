// ─── features/payment/utils/stripe-url.ts ────────────────────────────────────
//
// Security guard: every URL returned by the API that triggers a browser
// redirect MUST pass this check before navigation occurs.
//
// Rationale: if the backend is ever compromised or returns a malformed
// response, a missing guard creates an open-redirect vulnerability.

const ALLOWED_STRIPE_HOSTNAMES = new Set([
  "checkout.stripe.com",
  "connect.stripe.com",
  "dashboard.stripe.com",
]);

/**
 * Returns `true` only when the URL:
 *   1. Parses without throwing
 *   2. Uses HTTPS
 *   3. Points to an allow-listed Stripe hostname or any *.stripe.com subdomain
 *
 * @example
 * isSafeStripeUrl("https://checkout.stripe.com/pay/cs_live_xxx") // true
 * isSafeStripeUrl("http://evil.com/phish")                       // false
 * isSafeStripeUrl("javascript:alert(1)")                         // false
 */
export function isSafeStripeUrl(url: string): boolean {
  try {
    const { hostname, protocol } = new URL(url);
    return (
      protocol === "https:" &&
      (ALLOWED_STRIPE_HOSTNAMES.has(hostname) ||
        hostname.endsWith(".stripe.com"))
    );
  } catch {
    return false;
  }
}