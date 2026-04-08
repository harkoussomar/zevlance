package com.freelancehub.freelancehub.bid.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record CreateBidRequest(

        @Positive(message = "Proposed price must be positive")
        BigDecimal proposedPrice,

        @NotBlank(message = "Cover letter is required")
        @Size(min = 50, message = "Cover letter must be at least 50 characters")
        String coverLetter,

        @Positive(message = "Estimated days must be positive")
        @Max(value = 365, message = "Estimated days cannot exceed 365")
        int estimatedDays
) {}