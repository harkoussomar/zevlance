package com.freelancehub.freelancehub.payment.repository;

import com.freelancehub.freelancehub.payment.domain.StripeEventLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StripeEventLogRepository extends JpaRepository<StripeEventLog, String> {

    @Modifying
    @Query(value = """
            INSERT INTO stripe_event_log (id, type, processed, created_at)
            VALUES (:id, :type, false, NOW())
            ON CONFLICT (id) DO UPDATE
                SET type = EXCLUDED.type,
                    created_at = NOW(),
                    last_error = NULL
                WHERE stripe_event_log.processed = false
                  AND stripe_event_log.created_at < NOW() - INTERVAL '10 minutes'
            """, nativeQuery = true)
    int insertClaim(@Param("id") String id, @Param("type") String type);
}
