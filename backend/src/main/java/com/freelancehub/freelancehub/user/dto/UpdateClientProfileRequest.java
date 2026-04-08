package com.freelancehub.freelancehub.user.dto;

import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.URL;

/**
 * Partial update — every field is optional (null = leave unchanged).
 * Blank strings are treated as a clear/remove intent.
 *
 * Credentials (email, password) are intentionally excluded; those live
 * in a dedicated /auth/change-* flow.
 */
public record UpdateClientProfileRequest(

        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        String name,

        @Size(max = 255, message = "Profile picture URL must not exceed 255 characters")
        String profilePicture,

        @Size(max = 150, message = "Company name must not exceed 150 characters")
        String companyName,

        @Size(max = 1000, message = "Company description must not exceed 1000 characters")
        String companyDescription,

        @URL(message = "Website must be a valid URL (include https://)")
        @Size(max = 255, message = "Website URL must not exceed 255 characters")
        String website

) {}