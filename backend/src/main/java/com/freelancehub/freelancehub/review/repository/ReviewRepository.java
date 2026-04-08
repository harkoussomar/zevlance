package com.freelancehub.freelancehub.review.repository;

import com.freelancehub.freelancehub.review.domain.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, String> {

    // Duplicate review check — one per party per contract
    boolean existsByContractIdAndReviewerId(String contractId, String reviewerId);

    // Reviews written about a specific user (reviewee)
    List<Review> findByRevieweeId(String revieweeId);

    // Average rating for a user
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.reviewee.id = :userId")
    Double calculateAverageRating(@Param("userId") String userId);

    // Overall average rating across all reviews (for stats)
    @Query("SELECT AVG(r.rating) FROM Review r")
    Double calculateOverallAverageRating();


    long countByRevieweeId(String revieweeId);

    @Query("""
    SELECT r FROM Review r
    WHERE r.reviewee.id = :revieweeId
    ORDER BY r.createdAt DESC
    LIMIT :limit
    """)
    List<Review> findTopByRevieweeId(
            @Param("revieweeId") String revieweeId,
            @Param("limit") int limit
    );
}