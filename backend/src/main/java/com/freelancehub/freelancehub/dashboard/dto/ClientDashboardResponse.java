package com.freelancehub.freelancehub.dashboard.dto;

import java.util.List;

public record ClientDashboardResponse(
        UserSummaryDto user,
        ClientDashboardStats stats,
        List<DashboardProjectItem> recentProjects,
        List<DashboardContractItem> activeContracts
) {}