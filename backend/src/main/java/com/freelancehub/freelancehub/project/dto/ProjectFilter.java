package com.freelancehub.freelancehub.project.dto;

import com.freelancehub.freelancehub.project.domain.ProjectCategory;
import com.freelancehub.freelancehub.project.domain.ProjectStatus;

// Query params for filtering — all optional
public record ProjectFilter(
        ProjectCategory category,
        ProjectStatus status,
        Double budgetMin,
        Double budgetMax,
        String skill     // filters projects that require this skill
) {}