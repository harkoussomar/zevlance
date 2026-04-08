package com.freelancehub.freelancehub.auth.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "email_verification_tokens")
@Getter @Setter @NoArgsConstructor
public class EmailVerificationToken {

    @Id
    @Column(length = 36)
    private String token;

    @Column(nullable = false, length = 150)
    private String email;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private boolean used = false;

    public EmailVerificationToken(String token, String email) {
        this.token = token;
        this.email = email;
        this.expiresAt = LocalDateTime.now().plusHours(24);
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
}