package com.freelancehub.freelancehub.admin.repository;

import com.freelancehub.freelancehub.admin.domain.AdminAuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AdminAuditLogRepository extends JpaRepository<AdminAuditLog, UUID> {

    /** Used by the global audit log endpoint — all entries, newest first. */
    Page<AdminAuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    /**
     * Used by GET /admin/projects/{id}/audit-log.
     * Filters to entries where targetEntityType = "Project" and targetEntityId = projectId.
     * Spring Data derives the query from the method name — no @Query needed.
     */
    Page<AdminAuditLog> findByTargetEntityTypeAndTargetEntityIdOrderByCreatedAtDesc(
            String targetEntityType,
            String targetEntityId,
            Pageable pageable
    );
}
