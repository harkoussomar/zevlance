package com.freelancehub.freelancehub.contract.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateMilestoneRequest(

        @NotBlank(message = "Title is required")
        @Size(max = 200)
        String title,

        String description,

        @Positive(message = "Amount must be positive")
        BigDecimal amount,

        @NotNull(message = "Due date is required")
        @Future(message = "Due date must be in the future")
        LocalDate dueDate
) {}