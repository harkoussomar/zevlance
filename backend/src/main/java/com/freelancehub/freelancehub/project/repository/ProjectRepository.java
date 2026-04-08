package com.freelancehub.freelancehub.project.repository;

import com.freelancehub.freelancehub.project.domain.Project;
import com.freelancehub.freelancehub.project.domain.ProjectCategory;
import com.freelancehub.freelancehub.project.domain.ProjectStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, String> {

    // Client's own projects
    Page<Project> findByClientId(String clientId, Pageable pageable);

    // Filtered listing — all params optional
    @Query("""
        SELECT DISTINCT p FROM Project p
        WHERE (:category IS NULL OR p.category = :category)
          AND (:status IS NULL OR p.status = :status)
          AND (:budgetMin IS NULL OR p.budgetMax >= :budgetMin)
          AND (:budgetMax IS NULL OR p.budgetMin <= :budgetMax)
          AND (:skill IS NULL OR :skill MEMBER OF p.requiredSkills)
        ORDER BY p.createdAt DESC
        """)
    Page<Project> findWithFilters(
            @Param("category") ProjectCategory category,
            @Param("status") ProjectStatus status,
            @Param("budgetMin") BigDecimal budgetMin,
            @Param("budgetMax") BigDecimal budgetMax,
            @Param("skill") String skill,
            Pageable pageable
    );

    long countByStatus(ProjectStatus status);

    @Query("""
    SELECT COUNT(p) FROM Project p
    WHERE p.client.id = :clientId
    AND p.status = :status
    """)
    long countByClientIdAndStatus(
            @Param("clientId") String clientId,
            @Param("status") ProjectStatus status
    );

    @Query("""
    SELECT COALESCE(SUM(SIZE(p.bids)), 0)
    FROM Project p
    WHERE p.client.id = :clientId
    """)
    long sumBidCountByClientId(@Param("clientId") String clientId);

    @Query("""
    SELECT p FROM Project p
    WHERE p.client.id = :clientId
    ORDER BY p.createdAt DESC
    LIMIT :limit
    """)
    List<Project> findTopByClientId(
            @Param("clientId") String clientId,
            @Param("limit") int limit
    );



}