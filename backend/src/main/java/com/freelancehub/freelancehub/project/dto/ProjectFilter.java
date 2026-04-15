package com.freelancehub.freelancehub.project.dto;

import com.freelancehub.freelancehub.project.domain.ProjectCategory;
import com.freelancehub.freelancehub.project.domain.ProjectStatus;

import java.math.BigDecimal;

public record ProjectFilter(
        ProjectCategory category,
        ProjectStatus status,
        BigDecimal budgetMin,
        BigDecimal budgetMax,
        String skill,
        String query
) {}