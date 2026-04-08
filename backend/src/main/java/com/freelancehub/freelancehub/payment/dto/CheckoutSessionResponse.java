package com.freelancehub.freelancehub.payment.dto;

/**
 * Returned by POST /api/v1/milestones/{id}/fund.
 * The frontend redirects the client to checkoutUrl.
 */
public record CheckoutSessionResponse(
        String checkoutUrl,
        String sessionId
) {}