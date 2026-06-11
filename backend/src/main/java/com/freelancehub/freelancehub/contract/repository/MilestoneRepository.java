package com.freelancehub.freelancehub.contract.repository;

import com.freelancehub.freelancehub.contract.domain.Milestone;
import com.freelancehub.freelancehub.contract.domain.MilestoneStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import jakarta.persistence.LockModeType;

public interface MilestoneRepository extends JpaRepository<Milestone, String> {

    List<Milestone> findByContractId(String contractId);

    // Used to auto-complete contract when all milestones approved
    boolean existsByContractIdAndStatusNot(String contractId, MilestoneStatus status);

    // Bulk fetch — one query for all contracts, avoids N+1
    List<Milestone> findByContractIdIn(List<String> contractIds);

    // Next milestone per contract — used in service grouping
    @Query("""
    SELECT m FROM Milestone m
    WHERE m.contract.id IN :contractIds
    AND m.status IN ('PENDING', 'SUBMITTED')
    ORDER BY m.dueDate ASC
    """)
    List<Milestone> findPendingMilestonesByContractIds(
            @Param("contractIds") List<String> contractIds
    );

    Optional<Milestone> findByStripeCheckoutSessionId(String sessionId);

    Optional<Milestone> findByStripeRefundId(String refundId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT m FROM Milestone m WHERE m.id = :id")
    Optional<Milestone> findByIdForUpdate(@Param("id") String id);

    @Query("SELECT COALESCE(SUM(m.platformFeeAmount), 0) FROM Milestone m WHERE m.releasedAt IS NOT NULL")
    BigDecimal sumReleasedRevenue();

    /**
     * Daily released revenue for the last N days — for the chart.
     * Returns rows of [date_string, sum].
     */
    @Query(value = """
        SELECT DATE_TRUNC('day', m.released_at) AS date,
               COALESCE(SUM(m.platform_fee_amount), 0) AS amount
        FROM milestones m
        WHERE m.released_at IS NOT NULL
          AND m.released_at >= CURRENT_DATE - (:days * INTERVAL '1 day')
        GROUP BY DATE_TRUNC('day', m.released_at)
        ORDER BY DATE_TRUNC('day', m.released_at)
        """, nativeQuery = true)
    List<Object[]> findRevenueLastNDays(@Param("days") int days);


    /** Count disputed milestones (pending admin resolution). */
    @Query("SELECT COUNT(m) FROM Milestone m WHERE m.status = 'DISPUTED'")
    long countDisputed();
}
