package com.freelancehub.freelancehub.admin.dto;

import com.freelancehub.freelancehub.project.domain.ProjectCategory;
import com.freelancehub.freelancehub.project.domain.ProjectStatus;
import java.time.LocalDate;

public record AdminProjectFilter(
        ProjectStatus status,
        String clientId,
        ProjectCategory category,
        Boolean flagged,
        Boolean featured,
        LocalDate startDate,
        LocalDate endDate,
        String search
) {}