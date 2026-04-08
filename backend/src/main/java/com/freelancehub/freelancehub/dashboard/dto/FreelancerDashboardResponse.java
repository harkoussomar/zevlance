package com.freelancehub.freelancehub.dashboard.dto;

import java.util.List;

public record FreelancerDashboardResponse(
        FreelancerDashboardStats stats,
        List<DashboardContractItem> activeContracts,
        List<DashboardBidItem> recentBids,
        List<DashboardReviewItem> latestReviews
) {}