package com.freelancehub.freelancehub.contract.dto;

import com.freelancehub.freelancehub.contract.domain.Milestone;
import com.freelancehub.freelancehub.contract.domain.MilestoneStatus;

import java.math.BigDecimal;
import java.util.List;

/**
 * Milestone aggregate stats embedded inside {@link ContractResponse}.
 * Computed in Java from an already-fetched milestone list — no extra query needed.
 */
public record ContractMilestoneStats(
        int totalMilestones,
        int approvedCount,
        int pendingReviewCount,       // SUBMITTED milestones awaiting client review
        BigDecimal totalAllocated,    // sum of ALL milestone amounts
        BigDecimal clientTotalReleased,    // sum of APPROVED amounts  (what client paid out)
        BigDecimal freelancerTotalEarned   // sum of APPROVED payouts  (what freelancer received)
) {

    /** Zero-value stats — used when a contract has no milestones yet. */
    public static ContractMilestoneStats empty() {
        return new ContractMilestoneStats(0, 0, 0,
                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO);
    }

    /** Compute all stats from a list of milestones in a single pass. */
    public static ContractMilestoneStats from(List<Milestone> milestones) {
        if (milestones == null || milestones.isEmpty()) return empty();

        int approved = 0, submitted = 0;
        BigDecimal allocated     = BigDecimal.ZERO;
        BigDecimal clientPaid    = BigDecimal.ZERO;
        BigDecimal freelancerNet = BigDecimal.ZERO;

        for (Milestone m : milestones) {
            allocated = allocated.add(m.getAmount());

            if (m.getStatus() == MilestoneStatus.APPROVED) {
                approved++;
                clientPaid    = clientPaid.add(m.getAmount());
                // freelancerPayout is 0 until the payment service sets it at funding time;
                // fall back to amount so the field is never misleadingly zero.
                BigDecimal payout = (m.getFreelancerPayout() != null
                        && m.getFreelancerPayout().compareTo(BigDecimal.ZERO) > 0)
                        ? m.getFreelancerPayout()
                        : m.getAmount();
                freelancerNet = freelancerNet.add(payout);
            } else if (m.getStatus() == MilestoneStatus.SUBMITTED) {
                submitted++;
            }
        }

        return new ContractMilestoneStats(
                milestones.size(), approved, submitted,
                allocated, clientPaid, freelancerNet
        );
    }
}