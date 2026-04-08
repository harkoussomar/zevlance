// ─── features/payment/types.ts ────────────────────────────────────────────────

export interface CheckoutSessionResponse {
  checkoutUrl: string;
  sessionId: string;
}

export interface StripeConnectResponse {
  onboardingUrl: string | null;
  alreadyOnboarded: boolean;
}

