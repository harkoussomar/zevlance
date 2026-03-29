package com.freelancehub.freelancehub.admin.dto;

public record PlatformStatsResponse(
        long totalUsers,
        long totalFreelancers,
        long totalClients,
        long totalProjects,
        long openProjects,
        long inProgressProjects,
        long completedProjects,
        long totalBids,
        long totalContracts,
        long activeContracts,
        long completedContracts,
        long totalReviews,
        double averageRating
) {}