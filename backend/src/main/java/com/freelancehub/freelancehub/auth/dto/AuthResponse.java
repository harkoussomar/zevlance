package com.freelancehub.freelancehub.auth.dto;

public record AuthResponse(
        String token,
        String type,
        String email,
        String role,
        String userId
) {}