package com.freelancehub.freelancehub.admin.dto;

import java.math.BigDecimal;
import java.util.List;

public record PlatformStatsResponse(
        // ── Users ────────────────────────────────────────────────────────────────
        long totalUsers,
        long totalFreelancers,
        long totalClients,
        long suspendedUsers,        // new — users with active=false

        // ── Projects ─────────────────────────────────────────────────────────────
        long totalProjects,
        long openProjects,
        long inProgressProjects,
        long completedProjects,
        long flaggedProjects,       // new — projects with flagged=true
        long suspendedProjects,     // new — projects with status=SUSPENDED

        // ── Bids / Contracts ─────────────────────────────────────────────────────
        long totalBids,
        long totalContracts,
        long activeContracts,
        long completedContracts,
        long pendingDisputes,

        // ── Reviews ───────────────────────────────────────────────────────────────
        long totalReviews,
        double averageRating,

        // ── Revenue ───────────────────────────────────────────────────────────────
        BigDecimal revenueVolume,   // total released milestone payments (all time)

        // ── Time series (last 30 days) ────────────────────────────────────────────
        List<RevenueDataPoint> revenueOverTime,
        List<UserGrowthDataPoint> userGrowthOverTime
) {}