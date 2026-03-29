package com.freelancehub.freelancehub.project.dto;

import com.freelancehub.freelancehub.project.domain.ProjectCategory;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.List;

public record UpdateProjectRequest(

        @Size(max = 200)
        String title,

        String description,

        @Positive
        Double budgetMin,

        @Positive
        Double budgetMax,

        ProjectCategory category,

        List<String> requiredSkills,

        @Future
        LocalDate deadline
) {}