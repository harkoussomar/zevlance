package com.freelancehub.freelancehub.user.dto;

import java.util.List;

/**
 * Full freelancer profile — returned by:
 *   GET /api/v1/users/me          (own profile, when role=FREELANCER)
 *   GET /api/v1/freelancers/{id}  (public view)
 *
 * completedContracts is derived from the contract module at query time.
 * email is included even on the public view; hide it at the API gateway
 * or add a separate PublicFreelancerProfileResponse if privacy is needed.
 */
public record FreelancerProfileResponse(
        String id,
        String name,
        String email,
        String role,
        String profilePicture,
        String bio,
        Double hourlyRate,
        double rating,
        List<String> skills,
        long completedContracts
) {}