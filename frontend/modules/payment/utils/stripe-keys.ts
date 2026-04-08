// ─── features/payment/utils/stripe-keys.ts ───────────────────────────────────
//
// Centralised key factory for all Stripe-related React Query queries.
// Keeps the cache namespace consistent and eliminates magic strings at call sites.

export const stripeKeys = {
  /** ["stripe", "connect", "status"] */
  connectStatus: () => ["stripe", "connect", "status"] as const,
} as const;