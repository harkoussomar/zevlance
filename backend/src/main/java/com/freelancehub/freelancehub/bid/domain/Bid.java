package com.freelancehub.freelancehub.bid.domain;

import com.freelancehub.freelancehub.contract.domain.Contract;
import com.freelancehub.freelancehub.project.domain.Project;
import com.freelancehub.freelancehub.user.domain.Freelancer;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@SuppressWarnings("FieldMayBeFinal")
@Entity
@Table(
        name = "bids",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"freelancer_id", "project_id"}
        )
)
@Getter
@Setter
@NoArgsConstructor
public class Bid {

    @Id
    @Column(length = 36)
    @UuidGenerator
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "freelancer_id", nullable = false)
    private Freelancer freelancer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false)
    private BigDecimal proposedPrice;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String coverLetter;

    @Column(nullable = false)
    private int estimatedDays;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BidStatus status = BidStatus.PENDING;

    @OneToOne(mappedBy = "bid", fetch = FetchType.LAZY)
    private Contract contract;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime submittedAt;
}