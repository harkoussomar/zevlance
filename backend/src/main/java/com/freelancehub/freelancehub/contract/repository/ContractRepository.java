package com.freelancehub.freelancehub.contract.repository;

import com.freelancehub.freelancehub.contract.domain.Contract;
import com.freelancehub.freelancehub.contract.domain.ContractStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import jakarta.persistence.LockModeType;

public interface ContractRepository extends JpaRepository<Contract, String> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Contract c WHERE c.id = :id")
    Optional<Contract> findByIdForUpdate(@Param("id") String id);

    // ─── Both parties ──────────────────────────────────────────────────────────

    @Query("""
        SELECT c FROM Contract c
        WHERE c.bid.freelancer.id = :userId
           OR c.bid.project.client.id = :userId
        """)
    List<Contract> findAllByUserId(@Param("userId") String userId);

    @Query(value = """
        SELECT c FROM Contract c
        WHERE c.bid.freelancer.id = :userId
           OR c.bid.project.client.id = :userId
        """,
            countQuery = """
        SELECT COUNT(c) FROM Contract c
        WHERE c.bid.freelancer.id = :userId
           OR c.bid.project.client.id = :userId
        """)
    Page<Contract> findAllByUserId(@Param("userId") String userId, Pageable pageable);

    @Query(value = """
        SELECT c FROM Contract c
        WHERE (c.bid.freelancer.id = :userId OR c.bid.project.client.id = :userId)
          AND c.status = :status
        """,
            countQuery = """
        SELECT COUNT(c) FROM Contract c
        WHERE (c.bid.freelancer.id = :userId OR c.bid.project.client.id = :userId)
          AND c.status = :status
        """)
    Page<Contract> findAllByUserIdAndStatus(
            @Param("userId") String userId,
            @Param("status") ContractStatus status,
            Pageable pageable
    );

    @Query("""
        SELECT COUNT(c) > 0 FROM Contract c
        WHERE c.id = :contractId
          AND (c.bid.freelancer.id = :userId
               OR c.bid.project.client.id = :userId)
        """)
    boolean isPartyToContract(
            @Param("contractId") String contractId,
            @Param("userId") String userId
    );

    // ─── Freelancer-specific ───────────────────────────────────────────────────

    @Query("""
        SELECT c FROM Contract c
        WHERE c.bid.freelancer.id = :freelancerId
          AND c.status = :status
        ORDER BY c.startDate DESC
        LIMIT :limit
        """)
    List<Contract> findTopByFreelancerIdAndStatus(
            @Param("freelancerId") String freelancerId,
            @Param("status") ContractStatus status,
            @Param("limit") int limit
    );

    @Query("""
        SELECT COALESCE(SUM(c.agreedPrice), 0)
        FROM Contract c
        WHERE c.bid.freelancer.id = :freelancerId
          AND c.status = 'COMPLETED'
        """)
    BigDecimal sumEarnedByFreelancerId(@Param("freelancerId") String freelancerId);

    @Query("""
        SELECT COUNT(c) FROM Contract c
        WHERE c.bid.freelancer.id = :freelancerId
          AND c.status = :status
        """)
    long countByFreelancerIdAndStatus(
            @Param("freelancerId") String freelancerId,
            @Param("status") ContractStatus status
    );

    // ─── Client-specific ───────────────────────────────────────────────────────

    @Query("""
        SELECT c FROM Contract c
        WHERE c.bid.project.client.id = :clientId
          AND c.status = :status
        ORDER BY c.startDate DESC
        LIMIT :limit
        """)
    List<Contract> findTopByClientIdAndStatus(
            @Param("clientId") String clientId,
            @Param("status") ContractStatus status,
            @Param("limit") int limit
    );

    @Query("""
        SELECT COALESCE(SUM(c.agreedPrice), 0)
        FROM Contract c
        WHERE c.bid.project.client.id = :clientId
          AND c.status = 'COMPLETED'
        """)
    BigDecimal sumSpentByClientId(@Param("clientId") String clientId);

    @Query("""
        SELECT COUNT(c) FROM Contract c
        WHERE c.bid.project.client.id = :clientId
          AND c.status = :status
        """)
    long countByClientIdAndStatus(
            @Param("clientId") String clientId,
            @Param("status") ContractStatus status
    );

    // ─── Admin ─────────────────────────────────────────────────────────────────

    long countByStatus(ContractStatus status);

    @Query("SELECT COUNT(c) FROM Contract c WHERE c.bid.project.client.id = :clientId")
    long countByClientId(@Param("clientId") String clientId);

    @Query("SELECT COUNT(c) FROM Contract c WHERE c.bid.freelancer.id = :freelancerId")
    long countByFreelancerId(@Param("freelancerId") String freelancerId);

    @EntityGraph(attributePaths = {"bid", "bid.freelancer"})
    @Query("""
        SELECT c FROM Contract c
        WHERE c.bid.project.id = :projectId
        ORDER BY c.startDate DESC
        LIMIT 1
        """)
    java.util.Optional<Contract> findLatestByProjectId(
            @Param("projectId") String projectId
    );
}
