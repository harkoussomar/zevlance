package com.freelancehub.freelancehub.project.dto;

import com.freelancehub.freelancehub.project.domain.ProjectCategory;
import com.freelancehub.freelancehub.project.domain.ProjectStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

// Used for list endpoints — lightweight, no bids
public record ProjectSummaryResponse(
        String id,
        String title,
        BigDecimal budgetMin,
        BigDecimal budgetMax,
        ProjectStatus status,
        ProjectCategory category,
        List<String> requiredSkills,
        LocalDate deadline,
        String clientId,
        String clientName,
        int bidCount,
        LocalDateTime createdAt
) {}