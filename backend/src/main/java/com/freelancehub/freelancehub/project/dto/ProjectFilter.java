package com.freelancehub.freelancehub.project.dto;

import com.freelancehub.freelancehub.project.domain.ProjectCategory;
import com.freelancehub.freelancehub.project.domain.ProjectStatus;

import java.math.BigDecimal;

// Query params for filtering — all optional
public record ProjectFilter(
        ProjectCategory category,
        ProjectStatus status,
        BigDecimal budgetMin,
        BigDecimal budgetMax,
        String skill     // filters projects that require this skill
) {}