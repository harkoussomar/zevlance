// --- ResolveDisputeRequest.java ---
package com.freelancehub.freelancehub.dispute.dto;

import com.freelancehub.freelancehub.dispute.domain.DisputeOutcome;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResolveDisputeRequest(
        @NotNull(message = "Outcome is required")
        DisputeOutcome outcome,

        @NotBlank(message = "Explanation is required")
        @Size(min = 20, max = 1000, message = "Explanation must be between 20 and 1000 characters")
        String explanation
) {}
