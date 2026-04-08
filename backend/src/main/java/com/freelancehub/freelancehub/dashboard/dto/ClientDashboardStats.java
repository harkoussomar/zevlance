package com.freelancehub.freelancehub.dashboard.dto;


import java.math.BigDecimal;

public record ClientDashboardStats(
        long openProjectsCount,
        long activeContractsCount,
        long totalBidsReceived,
        BigDecimal totalSpent
) {}