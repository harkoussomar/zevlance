package com.freelancehub.freelancehub.project.domain;

import com.freelancehub.freelancehub.bid.domain.Bid;
import com.freelancehub.freelancehub.user.domain.Client;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@SuppressWarnings("FieldMayBeFinal")
@Entity
@Table(name = "projects")
@Getter @Setter @NoArgsConstructor
public class Project {

    @Id
    @UuidGenerator
    @Column(length = 36)
    private String id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private BigDecimal budgetMin;

    @Column(nullable = false)
    private BigDecimal budgetMax;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectStatus status = ProjectStatus.OPEN;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectCategory category;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "project_skills",
            joinColumns = @JoinColumn(name = "project_id")
    )
    @Column(name = "skill")
    private List<String> requiredSkills = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Bid> bids = new ArrayList<>();

    @Column(nullable = false)

    private LocalDate deadline;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    // ── Admin moderation fields ────────────────────────────────────────────────

    /** True when this project has been flagged for policy review. */
    @Column(nullable = false)
    private boolean flagged = false;

    /** True when this project is pinned to the platform's featured section. */
    @Column(nullable = false)
    private boolean featured = false;

    /** Internal admin note — never surfaced to end users. */
    @Column(name = "admin_note", columnDefinition = "TEXT")
    private String adminNote;

    // ── Timestamps ────────────────────────────────────────────────────────────

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    /**
     * Auto-updated on any field change.
     * Required for cache busting on the frontend and audit trail display.
     */
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}