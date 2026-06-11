// --- DisputeEvidence.java ---
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
@Table(name = "dispute_evidence")
@Getter @Setter @NoArgsConstructor
public class DisputeEvidence {

    @Id
    @UuidGenerator
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dispute_id", nullable = false)
    private Dispute dispute;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploader_id", nullable = false)
    private User uploader;

    @Column(nullable = false, length = 500)
    private String fileUrl;

    @Column(nullable = false, length = 512)
    private String publicId;

    @Column(nullable = false)
    private String fileName;

    private String description;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}