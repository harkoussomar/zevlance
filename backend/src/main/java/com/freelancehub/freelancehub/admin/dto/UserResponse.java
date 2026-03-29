package com.freelancehub.freelancehub.admin.dto;

public record UserResponse(
        String id,
        String email,
        String role,
        boolean active
) {}
