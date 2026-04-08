package com.freelancehub.freelancehub.dashboard.dto;

import com.freelancehub.freelancehub.contract.domain.MilestoneStatus;
import java.time.LocalDate;

public record NextMilestoneDto(
        String title,
        LocalDate dueDate,
        MilestoneStatus status
) {}