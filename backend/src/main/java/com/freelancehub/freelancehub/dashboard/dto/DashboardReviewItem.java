package com.freelancehub.freelancehub.dashboard.dto;

import java.time.LocalDateTime;

public record DashboardReviewItem(
        String id,
        String reviewerName,
        int rating,
        String comment,
        LocalDateTime createdAt
) {}