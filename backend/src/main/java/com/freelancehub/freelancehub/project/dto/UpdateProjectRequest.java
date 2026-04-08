package com.freelancehub.freelancehub.project.dto;

import com.freelancehub.freelancehub.project.domain.ProjectCategory;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record UpdateProjectRequest(

        @Size(max = 200)
        String title,

        String description,

        @Positive
        BigDecimal budgetMin,

        @Positive
        BigDecimal budgetMax,

        ProjectCategory category,

        List<String> requiredSkills,

        @Future
        LocalDate deadline
) {}