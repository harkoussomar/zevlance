package com.freelancehub.freelancehub.contract.repository;

import com.freelancehub.freelancehub.contract.domain.Milestone;
import com.freelancehub.freelancehub.contract.domain.MilestoneStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

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


}