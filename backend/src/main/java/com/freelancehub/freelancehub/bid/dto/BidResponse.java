package com.freelancehub.freelancehub.bid.dto;

import com.freelancehub.freelancehub.bid.domain.BidStatus;

import java.time.LocalDateTime;

public record BidResponse(
        String id,
        String projectId,
        String projectTitle,
        String freelancerId,
        String freelancerName,
        double proposedPrice,
        String coverLetter,
        int estimatedDays,
        BidStatus status,
        LocalDateTime submittedAt
) {}