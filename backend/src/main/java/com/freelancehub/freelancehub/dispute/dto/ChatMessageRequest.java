package com.freelancehub.freelancehub.dispute.dto;

import jakarta.validation.constraints.NotBlank;

public record ChatMessageRequest(
        @NotBlank(message = "Message cannot be empty") String message
) {}