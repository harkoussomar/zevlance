package com.freelancehub.freelancehub.auth.dto;

public record LoginResult(
        String token,
        AuthResponse user
) {}