package com.freelancehub.freelancehub.auth.repository;

import com.freelancehub.freelancehub.auth.domain.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, String> {
    Optional<PasswordResetToken> findByTokenAndUsedFalse(String token);
    void deleteByEmail(String email);
}