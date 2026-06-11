package com.freelancehub.freelancehub.contract.dto;

import com.freelancehub.freelancehub.contract.domain.MilestoneStatus;
import com.freelancehub.freelancehub.payment.domain.RefundStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

import java.math.BigDecimal;

public record MilestoneResponse(
        String id,
        String contractId,
        String title,
        String description,
        BigDecimal amount,
        MilestoneStatus status,
        LocalDate dueDate,
        String deliverableUrl,
        BigDecimal platformFeeAmount,
        BigDecimal freelancerPayout,
        LocalDateTime fundedAt,
        LocalDateTime releasedAt,
        int revisionCount,
        RefundStatus refundStatus
) {}
