package com.freelancehub.freelancehub.payment.dto;

public final class StripeConnectResponse {

    private final String onboardingUrl;
    private final boolean alreadyOnboarded;

    private StripeConnectResponse(String onboardingUrl, boolean alreadyOnboarded) {
        this.onboardingUrl = onboardingUrl;
        this.alreadyOnboarded = alreadyOnboarded;
    }

    public static StripeConnectResponse alreadyOnboarded() {
        return new StripeConnectResponse(null, true);
    }

    public static StripeConnectResponse withUrl(String url) {
        return new StripeConnectResponse(url, false);
    }

    public String getOnboardingUrl()   { return onboardingUrl; }
    public boolean isAlreadyOnboarded() { return alreadyOnboarded; }
}