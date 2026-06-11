package com.freelancehub.freelancehub.admin.dto;

import com.freelancehub.freelancehub.project.domain.ProjectCategory;
import com.freelancehub.freelancehub.project.domain.ProjectStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record AdminProjectDetailResponse(
        String id,
        String title,
        String description,
        BigDecimal budgetMin,
        BigDecimal budgetMax,
        ProjectStatus status,
        ProjectCategory category,
        List<String> requiredSkills,
        LocalDate deadline,
        String clientId,
        String clientName,
        String clientEmail,
        boolean flagged,
        boolean featured,
        String adminNote,
        int bidCount,
        List<BidSummary> bids,
        ContractSummary contract,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public record BidSummary(
            String id,
            String freelancerId,
            String freelancerName,
            BigDecimal amount,
            String status,
            LocalDateTime createdAt
    ) {}

    /**
     * startDate uses LocalDate — matches the Contract entity field type.
     * Using LocalDateTime here caused: "incompatible types: LocalDate cannot be converted to LocalDateTime"
     */
    public record ContractSummary(
            String id,
            String status,
            String freelancerId,
            String freelancerName,
            BigDecimal agreedPrice,
            LocalDate startDate
    ) {}
}