package com.freelancehub.freelancehub.dashboard.dto;

import com.freelancehub.freelancehub.project.domain.ProjectStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record DashboardProjectItem(
        String id,
        String title,
        ProjectStatus status,
        BigDecimal budgetMin,
        BigDecimal budgetMax,
        LocalDate deadline,
        int bidCount,
        List<String> requiredSkills
) {}