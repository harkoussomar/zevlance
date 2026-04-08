package com.freelancehub.freelancehub.project.domain;

import com.freelancehub.freelancehub.bid.domain.Bid;
import com.freelancehub.freelancehub.user.domain.Client;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

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
    @GeneratedValue(strategy = GenerationType.UUID)
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

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL)
    private List<Bid> bids = new ArrayList<>();

    @Column(nullable = false)
    private LocalDate deadline;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}