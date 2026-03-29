package com.freelancehub.freelancehub.review.dto;

import java.time.LocalDateTime;

public record ReviewResponse(
        String id,
        String contractId,
        String reviewerId,
        String reviewerName,
        String revieweeId,
        String revieweeName,
        int rating,
        String comment,
        LocalDateTime createdAt
) {}