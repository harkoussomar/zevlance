package com.freelancehub.freelancehub.user.dto;

public record BasicProfileResponse(
        String id,
        String name,
        String email,
        String role,
        String profilePicture
) {}