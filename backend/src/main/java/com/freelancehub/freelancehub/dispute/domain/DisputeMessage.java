// --- DisputeMessage.java ---
package com.freelancehub.freelancehub.dispute.domain;

import com.freelancehub.freelancehub.user.domain.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;

@Entity
@Table(name = "dispute_messages")
@Getter @Setter @NoArgsConstructor
public class DisputeMessage {

    @Id
    @UuidGenerator
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dispute_id", nullable = false)
    private Dispute dispute;

    // 🔒 FIX: Made nullable. System messages have no real human sender.
    // Previously sender was non-nullable and sendSystemMessage() was incorrectly
    // assigning the initiator as the sender on ALL system messages — even when
    // the other party performed the action (e.g. escalation by the freelancer
    // would show up as sent by the client if the client opened the dispute).
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = true)
    private User sender;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    // 🐛 FIX: Renamed from `isSystemMessage` to `systemMessage`.
    // A Lombok @Getter on a boolean field named `isSystemMessage` generates
    // the getter isSystemMessage(), which Jackson then serializes as
    // "systemMessage" (stripping the `is` prefix). This causes a mismatch
    // between the Java field name and the JSON key. Renaming to `systemMessage`
    // makes Lombok generate isSystemMessage() correctly, and Jackson will
    // serialize it as "systemMessage" consistently.
    @Column(name = "is_system_message", nullable = false)
    private boolean systemMessage = false;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}