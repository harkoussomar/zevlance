package com.freelancehub.freelancehub.dashboard.dto;

import java.math.BigDecimal;

public record FreelancerDashboardStats(
        BigDecimal totalEarned,
        long activeContractsCount,
        long pendingBidsCount,
        Double avgRating,      // null when no reviews yet — never 0
        long reviewCount
) {}