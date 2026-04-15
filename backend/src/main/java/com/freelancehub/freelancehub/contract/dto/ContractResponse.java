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
        LocalDateTime createdAt,

        // ── Milestone aggregates ──────────────────────────────────────────────
        // Embedded here so callers (e.g. ContractCard list) never need a
        // separate per-contract milestones request just to render summary data.

        /** Total number of milestones defined on this contract. */
        int totalMilestones,

        /** Number of milestones with status APPROVED. */
        int approvedMilestones,

        /** Number of milestones with status SUBMITTED (awaiting client review). */
        int pendingReviewCount,

        /** Sum of all milestone amounts regardless of status. */
        BigDecimal totalAllocated,

        /** Sum of APPROVED milestone amounts — total the client has paid out. */
        BigDecimal clientTotalReleased,

        /** Sum of APPROVED milestone freelancerPayout values — total the freelancer has earned. */
        BigDecimal freelancerTotalEarned
) {}