package com.freelancehub.freelancehub.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminReasonRequest(
        @NotBlank @Size(min = 5, max = 500) String reason
) {}
