package com.freelancehub.freelancehub.dispute.dto;

import java.time.LocalDateTime;

public record DisputeMessageResponse(
        String id,
        String senderId,
        String senderName,
        String senderRole,
        String message,
        boolean isSystemMessage,
        LocalDateTime createdAt
) {}