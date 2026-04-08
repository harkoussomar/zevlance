package com.freelancehub.freelancehub.dashboard.dto;

import com.freelancehub.freelancehub.contract.domain.ContractStatus;

import java.math.BigDecimal;

public record DashboardContractItem(
        String id,
        String projectTitle,
        String clientName,
        String freelancerName,
        BigDecimal agreedPrice,
        ContractStatus status,
        MilestoneSummaryDto milestoneSummary
) {}