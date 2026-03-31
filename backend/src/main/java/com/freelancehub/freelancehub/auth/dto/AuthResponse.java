package com.freelancehub.freelancehub.auth.dto;

public record AuthResponse(
        String email,
        String role,
        String userId
) {}