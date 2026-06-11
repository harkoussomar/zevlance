package com.freelancehub.freelancehub.admin.dto;

import java.time.LocalDateTime;

public record UserResponse(
        String id,
        String email,
        String name,
        String role,
        boolean active,
        LocalDateTime joinedAt
) {}