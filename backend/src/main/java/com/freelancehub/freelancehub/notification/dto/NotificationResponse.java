package com.freelancehub.freelancehub.notification.dto;

import com.freelancehub.freelancehub.notification.domain.NotificationType;
import java.time.LocalDateTime;

public record NotificationResponse(
        String id,
        NotificationType type,
        String title,
        String message,
        boolean read,
        String referenceId,
        String referenceType,
        LocalDateTime createdAt
) {}