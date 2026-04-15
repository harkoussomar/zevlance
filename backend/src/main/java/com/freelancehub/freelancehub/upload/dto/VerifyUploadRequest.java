package com.freelancehub.freelancehub.upload.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record VerifyUploadRequest(
        @NotBlank
        @Size(max = 512)
        String publicId,

        @NotBlank
        @Size(max = 512)
        String secureUrl
) {}