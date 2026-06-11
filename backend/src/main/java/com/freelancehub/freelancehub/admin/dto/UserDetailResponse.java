package com.freelancehub.freelancehub.admin.dto;

import java.time.LocalDateTime;

public record UserDetailResponse(
        String id,
        String email,
        String name,
        String phone,
        String profilePicture,
        String role,
        boolean active,
        boolean emailVerified,
        LocalDateTime joinedAt,
        LocalDateTime updatedAt,

        // Role-specific stats (null when not applicable)
        Long totalProjects,       // CLIENT: projects posted; FREELANCER: projects won
        Long totalBids,           // FREELANCER only
        Long totalContracts,
        Double averageRating,     // FREELANCER only
        Long totalReviews
) {}