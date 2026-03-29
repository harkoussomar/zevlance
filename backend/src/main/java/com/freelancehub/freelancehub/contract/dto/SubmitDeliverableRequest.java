package com.freelancehub.freelancehub.contract.dto;

import jakarta.validation.constraints.NotBlank;

public record SubmitDeliverableRequest(

        @NotBlank(message = "Deliverable URL is required")
        String deliverableUrl
) {}