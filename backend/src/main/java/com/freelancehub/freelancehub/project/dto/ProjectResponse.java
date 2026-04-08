package com.freelancehub.freelancehub.project.dto;

import com.freelancehub.freelancehub.project.domain.ProjectCategory;
import com.freelancehub.freelancehub.project.domain.ProjectStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

// Used for single project endpoint — full detail
public record ProjectResponse(
        String id,
        String title,
        String description,
        BigDecimal budgetMin,
        BigDecimal budgetMax,
        ProjectStatus status,
        ProjectCategory category,
        List<String> requiredSkills,
        LocalDate deadline,
        String clientId,
        String clientName,
        String clientCompany,
        int bidCount,
        LocalDateTime createdAt
) {}