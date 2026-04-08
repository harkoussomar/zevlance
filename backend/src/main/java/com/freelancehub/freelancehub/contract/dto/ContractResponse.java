package com.freelancehub.freelancehub.contract.dto;

import com.freelancehub.freelancehub.contract.domain.ContractStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ContractResponse(
        String id,
        String bidId,
        String projectId,
        String projectTitle,
        String freelancerId,
        String freelancerName,
        String clientId,
        String clientName,
        ContractStatus status,
        BigDecimal agreedPrice,
        LocalDate startDate,
        LocalDate endDate,
        LocalDateTime createdAt
) {}