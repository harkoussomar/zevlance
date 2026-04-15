package com.freelancehub.freelancehub.bid.dto;

public record BidSummaryResponse(
        long pending,
        long accepted,
        long rejected,
        long withdrawn,
        double totalValue,
        double successRate
) {}
