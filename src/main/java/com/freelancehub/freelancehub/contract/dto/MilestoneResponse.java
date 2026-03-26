package com.freelancehub.freelancehub.contract.dto;

import com.freelancehub.freelancehub.contract.domain.MilestoneStatus;

import java.time.LocalDate;

public record MilestoneResponse(
        String id,
        String contractId,
        String title,
        String description,
        double amount,
        MilestoneStatus status,
        LocalDate dueDate,
        String deliverableUrl
) {}