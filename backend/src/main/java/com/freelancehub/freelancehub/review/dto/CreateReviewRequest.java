package com.freelancehub.freelancehub.review.dto;

import jakarta.validation.constraints.*;

public record CreateReviewRequest(

        @Min(value = 1, message = "Rating must be at least 1")
        @Max(value = 5, message = "Rating must be at most 5")
        int rating,

        @Size(max = 1000, message = "Comment must not exceed 1000 characters")
        String comment
) {}