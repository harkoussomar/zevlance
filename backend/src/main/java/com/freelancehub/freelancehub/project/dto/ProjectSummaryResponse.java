package com.freelancehub.freelancehub.project.dto;

import com.freelancehub.freelancehub.project.domain.ProjectCategory;
import com.freelancehub.freelancehub.project.domain.ProjectStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Lightweight project projection used for list endpoints.
 * Does NOT include description, full bid list, or contract — use ProjectDetailResponse for those.
 */
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
        boolean flagged,
        boolean featured,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}