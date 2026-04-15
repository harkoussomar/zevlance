package com.freelancehub.freelancehub.contract.dto;

import java.math.BigDecimal;

/**
 * Lightweight aggregate returned by GET /api/v1/contracts/my/summary.
 * Independent of pagination — always reflects the user's full contract history.
 */
public record ContractSummaryResponse(
        long totalContracts,
        long activeCount,
        long completedCount,
        long disputedCount,
        long cancelledCount,
        BigDecimal activeValue,          // sum of agreedPrice for ACTIVE contracts
        BigDecimal clientTotalReleased,  // total paid out across all contracts (CLIENT view)
        BigDecimal freelancerTotalEarned // total earned across all contracts (FREELANCER view)
) {}
