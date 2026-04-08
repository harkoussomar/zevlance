package com.freelancehub.freelancehub.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Used by PATCH /api/v1/users/me/password.
 * currentPassword is verified against the stored hash before applying the change.
 */
public record UpdatePasswordRequest(

        @NotBlank(message = "Current password is required")
        String currentPassword,

        @NotBlank(message = "New password is required")
        @Size(min = 8, max = 128, message = "New password must be between 8 and 128 characters")
        String newPassword

) {}