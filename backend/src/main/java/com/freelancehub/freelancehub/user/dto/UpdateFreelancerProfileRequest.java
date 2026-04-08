package com.freelancehub.freelancehub.user.dto;

import jakarta.validation.constraints.*;
import java.util.List;

/**
 * Partial update — every field is optional (null = leave unchanged).
 * Blank strings are treated as a clear/remove intent.
 *
 * profilePicture should be the final Cloudinary URL after the client
 * has already uploaded the image (pre-signed upload flow).
 *
 * Credentials (email, password) are intentionally excluded.
 */
public record UpdateFreelancerProfileRequest(

        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        String name,

        @Size(max = 512, message = "Profile picture URL must not exceed 512 characters")
        String profilePicture,

        @Size(max = 2000, message = "Bio must not exceed 2000 characters")
        String bio,

        @DecimalMin(value = "0.0", inclusive = false, message = "Hourly rate must be greater than 0")
        @DecimalMax(value = "9999.99", message = "Hourly rate must not exceed 9999.99")
        Double hourlyRate,

        @Size(max = 20, message = "You can list at most 20 skills")
        List<@NotBlank @Size(max = 50, message = "Each skill must not exceed 50 characters") String> skills

) {}