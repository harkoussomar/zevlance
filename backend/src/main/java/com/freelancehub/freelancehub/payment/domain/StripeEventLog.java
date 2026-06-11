package com.freelancehub.freelancehub.payment.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Tracks processed Stripe webhook events to guarantee idempotency.
 *
 * Stripe may deliver the same event more than once. Before processing,
 * we check if the event ID already exists here — if it does, we return
 * 200 OK immediately without re-executing the business logic.
 */
@Entity
@Table(name = "stripe_event_log")
@Getter @Setter @NoArgsConstructor
public class StripeEventLog {

    /** Stripe event ID (evt_...) — serves as the natural primary key. */
    @Id
    @Column(length = 255)
    private String id;

    @Column(nullable = false, length = 100)
    private String type;

    @Column(nullable = false)
    private boolean processed = false;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Column(columnDefinition = "TEXT")
    private String lastError;

    public StripeEventLog(String id, String type) {
        this.id = id;
        this.type = type;
    }
}
