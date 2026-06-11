package com.freelancehub.freelancehub.dispute.dto;

import com.freelancehub.freelancehub.dispute.domain.DisputeStatus;

import java.time.LocalDateTime;
import java.util.List;

public record DisputeDetailsResponse(
        String id,
        String contractId,
        String initiatorId,
        String reason,
        DisputeStatus status,
        LocalDateTime createdAt,
        List<DisputeMessageResponse> messages,
        List<DisputeEvidenceResponse> evidence
) {}