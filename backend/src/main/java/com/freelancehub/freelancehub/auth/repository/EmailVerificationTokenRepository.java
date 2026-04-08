package com.freelancehub.freelancehub.auth.repository;

import com.freelancehub.freelancehub.auth.domain.EmailVerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmailVerificationTokenRepository
        extends JpaRepository<EmailVerificationToken, String> {

    Optional<EmailVerificationToken> findByTokenAndUsedFalse(String token);
    void deleteByEmail(String email);
}