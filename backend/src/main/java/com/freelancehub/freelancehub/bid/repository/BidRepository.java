package com.freelancehub.freelancehub.bid.repository;

import com.freelancehub.freelancehub.bid.domain.Bid;
import com.freelancehub.freelancehub.bid.domain.BidStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BidRepository extends JpaRepository<Bid, String> {

    // ── existing (unchanged) ──────────────────────────────────────────────────

    boolean existsByFreelancerIdAndProjectId(String freelancerId, String projectId);

    Page<Bid> findByProjectId(String projectId, Pageable pageable);

    Page<Bid> findByFreelancerId(String freelancerId, Pageable pageable);

    @Modifying
    @Query("""
        UPDATE Bid b SET b.status = :status
        WHERE b.project.id = :projectId
          AND b.id != :acceptedBidId
          AND b.status = 'PENDING'
        """)
    void rejectOtherBids(
            @Param("projectId") String projectId,
            @Param("acceptedBidId") String acceptedBidId,
            @Param("status") BidStatus status
    );

    @Query("""
        SELECT COUNT(b) FROM Bid b
        WHERE b.freelancer.id = :freelancerId
          AND b.status = :status
        """)
    long countByFreelancerIdAndStatus(
            @Param("freelancerId") String freelancerId,
            @Param("status") BidStatus status
    );

    @Query("""
        SELECT b FROM Bid b
        WHERE b.freelancer.id = :freelancerId
        ORDER BY b.submittedAt DESC
        LIMIT :limit
        """)
    List<Bid> findTopByFreelancerId(
            @Param("freelancerId") String freelancerId,
            @Param("limit") int limit
    );

    // ── new ───────────────────────────────────────────────────────────────────

    /** Filtered paginated list — used when a status tab is active. */
    Page<Bid> findByFreelancerIdAndStatus(String freelancerId, BidStatus status, Pageable pageable);

    /** Sum of proposedPrice for all accepted bids — used by the summary endpoint. */
    @Query("""
        SELECT COALESCE(SUM(b.proposedPrice), 0)
        FROM Bid b
        WHERE b.freelancer.id = :freelancerId
          AND b.status = 'ACCEPTED'
        """)
    double sumAcceptedValueByFreelancerId(@Param("freelancerId") String freelancerId);
}