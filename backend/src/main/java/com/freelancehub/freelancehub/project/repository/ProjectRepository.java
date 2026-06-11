package com.freelancehub.freelancehub.project.repository;

import com.freelancehub.freelancehub.project.domain.Project;
import com.freelancehub.freelancehub.project.domain.ProjectCategory;
import com.freelancehub.freelancehub.project.domain.ProjectStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, String>, JpaSpecificationExecutor<Project> {

    // ── Client own projects ────────────────────────────────────────────────────

    Page<Project> findByClientId(String clientId, Pageable pageable);

    // ── Public browsing (full-text + filters, non-deleted only) ───────────────

    @Query(value = """
    SELECT * FROM (
        SELECT DISTINCT p.*
        FROM projects p
        LEFT JOIN project_skills ps ON ps.project_id = p.id
        WHERE p.deleted_at IS NULL
          AND (:category IS NULL OR p.category = :category)
          AND (:status IS NULL OR p.status = :status)
          AND (:budgetMin IS NULL OR p.budget_max >= :budgetMin)
          AND (:budgetMax IS NULL OR p.budget_min <= :budgetMax)
          AND (:skill IS NULL OR ps.skill = :skill)
          AND (:query IS NULL OR p.search_vector @@ plainto_tsquery('english', :query))
    ) p
    ORDER BY
        CASE WHEN :query IS NULL THEN 0
             ELSE ts_rank(p.search_vector, plainto_tsquery('english', :query))
        END DESC,
        p.created_at DESC
    """,
            countQuery = """
    SELECT COUNT(DISTINCT p.id) FROM projects p
    LEFT JOIN project_skills ps ON ps.project_id = p.id
    WHERE p.deleted_at IS NULL
      AND (:category IS NULL OR p.category = :category)
      AND (:status IS NULL OR p.status = :status)
      AND (:budgetMin IS NULL OR p.budget_max >= :budgetMin)
      AND (:budgetMax IS NULL OR p.budget_min <= :budgetMax)
      AND (:skill IS NULL OR ps.skill = :skill)
      AND (:query IS NULL OR p.search_vector @@ plainto_tsquery('english', :query))
    """,
            nativeQuery = true)
    Page<Project> findWithFilters(
            @Param("category") String category,
            @Param("status") String status,
            @Param("budgetMin") BigDecimal budgetMin,
            @Param("budgetMax") BigDecimal budgetMax,
            @Param("skill") String skill,
            @Param("query") String query,
            Pageable pageable
    );

    // ── Count helpers ──────────────────────────────────────────────────────────

    long countByStatus(ProjectStatus status);

    @Query("SELECT COUNT(p) FROM Project p WHERE p.client.id = :clientId AND p.status = :status")
    long countByClientIdAndStatus(
            @Param("clientId") String clientId,
            @Param("status") ProjectStatus status
    );

    @Query("SELECT COALESCE(SUM(SIZE(p.bids)), 0) FROM Project p WHERE p.client.id = :clientId")
    long sumBidCountByClientId(@Param("clientId") String clientId);

    @Query("SELECT COUNT(p) FROM Project p WHERE p.client.id = :clientId")
    long countByClientId(@Param("clientId") String clientId);

    // ── Dashboard helpers ──────────────────────────────────────────────────────

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


    long countByFlagged(boolean flagged);

    @Query("SELECT COUNT(p) FROM Project p WHERE p.status = 'SUSPENDED' AND p.deletedAt IS NULL")
    long countSuspended();

    @EntityGraph(attributePaths = {"client", "bids", "bids.freelancer"})
    @Query("SELECT p FROM Project p WHERE p.id = :projectId")
    Optional<Project> findAdminDetailById(@Param("projectId") String projectId);
}
