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

    // Duplicate bid check
    boolean existsByFreelancerIdAndProjectId(String freelancerId, String projectId);

    // All bids on a project (for client)
    Page<Bid> findByProjectId(String projectId, Pageable pageable);

    // Freelancer's own bids
    Page<Bid> findByFreelancerId(String freelancerId, Pageable pageable);

    // Reject all other pending bids when one is accepted
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
}