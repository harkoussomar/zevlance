package com.freelancehub.freelancehub.dispute.dto;

import java.time.LocalDateTime;

public record DisputeEvidenceResponse(
        String id,
        String uploaderId,
        String uploaderName,
        String fileUrl,
        String fileName,
        String description,
        LocalDateTime createdAt
) {}