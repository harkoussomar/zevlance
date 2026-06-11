package com.freelancehub.freelancehub.user.repository;

import com.freelancehub.freelancehub.user.domain.Role;
import com.freelancehub.freelancehub.user.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);


    @Query("""
        SELECT u FROM User u
        WHERE (:role   IS NULL OR u.role   = :role)
          AND (:active IS NULL OR u.active = :active)
          AND (
               :search IS NULL OR :search = ''
               OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(u.name)  LIKE LOWER(CONCAT('%', :search, '%'))
          )
        """)
    Page<User> findForAdmin(
            @Param("role")   Role    role,
            @Param("active") Boolean active,
            @Param("search") String  search,
            Pageable pageable
    );

    long countByActiveFalse();


    /**
     * User registrations grouped by date for the last N days.
     * Returns rows of [date_string, count].
     * Cast to CAST(u.createdAt AS date) works on PostgreSQL.
     */
    @Query(value = """
        SELECT DATE_TRUNC('day', u.created_at) AS date,
               COUNT(*) AS users
        FROM users u
        WHERE u.created_at >= CURRENT_DATE - (:days * INTERVAL '1 day')
        GROUP BY DATE_TRUNC('day', u.created_at)
        ORDER BY DATE_TRUNC('day', u.created_at)
        """, nativeQuery = true)
    List<Object[]> findUserGrowthLastNDays(@Param("days") int days);
}