package com.freelancehub.freelancehub.admin.dto;

import com.freelancehub.freelancehub.project.domain.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

// ── PATCH /admin/projects/{id}/status ─────────────────────────────────────────

public record ChangeProjectStatusRequest(
        @NotNull ProjectStatus status,
        @NotBlank @Size(min = 5, max = 500) String reason
) {}


// ── PATCH /admin/projects/{id}/flag ──────────────────────────────────────────

// In a separate file normally; combined here for brevity.

// FlagProjectRequest → see FlagProjectRequest.java
// FeatureProjectRequest → see FeatureProjectRequest.java