package com.freelancehub.freelancehub.dashboard.dto;

import com.freelancehub.freelancehub.bid.domain.BidStatus;

import java.math.BigDecimal;

public record DashboardBidItem(
        String id,
        String projectTitle,
        BigDecimal proposedPrice,
        int estimatedDays,
        BidStatus status
) {}