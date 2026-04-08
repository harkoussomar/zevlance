package com.freelancehub.freelancehub.user.dto;

/**
 * Full client profile — returned by GET /api/v1/users/me (when role=CLIENT).
 * Also used as the update response body.
 *
 * postedProjects is derived from the project module at query time.
 */
public record ClientProfileResponse(
        String id,
        String name,
        String email,
        String role,
        String profilePicture,
        String companyName,
        String companyDescription,
        String website,
        double rating,
        long postedProjects
) {}