// --- AddEvidenceRequest.java ---
package com.freelancehub.freelancehub.dispute.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AddEvidenceRequest(
        @NotBlank(message = "Public ID is required")
        @Size(max = 512)
        String publicId,

        @NotBlank(message = "Secure URL is required")
        @Size(max = 512)
        String secureUrl,

        @NotBlank(message = "File name is required")
        @Size(max = 255)
        String fileName,

        @Size(max = 1000)
        String description
) {}