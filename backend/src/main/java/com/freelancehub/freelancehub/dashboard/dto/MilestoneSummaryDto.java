package com.freelancehub.freelancehub.dashboard.dto;

public record MilestoneSummaryDto(
        int total,
        int approved,
        NextMilestoneDto nextMilestone  // null if none pending
) {}