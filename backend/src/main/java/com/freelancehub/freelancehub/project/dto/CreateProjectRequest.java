package com.freelancehub.freelancehub.project.dto;

import com.freelancehub.freelancehub.project.domain.ProjectCategory;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record CreateProjectRequest(

        @NotBlank(message = "Title is required")
        @Size(max = 200, message = "Title must not exceed 200 characters")
        String title,

        @NotBlank(message = "Description is required")
        String description,

        @Positive(message = "Budget min must be positive")
        BigDecimal budgetMin,

        @Positive(message = "Budget max must be positive")
        BigDecimal budgetMax,

        @NotNull(message = "Category is required")
        ProjectCategory category,

        List<String> requiredSkills,

        @NotNull(message = "Deadline is required")
        @Future(message = "Deadline must be in the future")
        LocalDate deadline
) {}