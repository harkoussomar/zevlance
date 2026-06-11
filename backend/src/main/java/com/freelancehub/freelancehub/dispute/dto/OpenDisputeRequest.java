package com.freelancehub.freelancehub.dispute.dto;

import jakarta.validation.constraints.NotBlank;

public record OpenDisputeRequest(
        @NotBlank(message = "Reason is required") String reason
) {}