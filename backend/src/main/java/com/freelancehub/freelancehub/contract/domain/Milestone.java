package com.freelancehub.freelancehub.contract.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@SuppressWarnings("FieldMayBeFinal")
@Entity
@Table(name = "milestones")
@Getter @Setter @NoArgsConstructor
public class Milestone {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private BigDecimal amount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MilestoneStatus status = MilestoneStatus.PENDING;

    @Column(nullable = false)
    private LocalDate dueDate;

    private String deliverableUrl;

    // ── Payment / Escrow fields ────────────────────────────────────────────────

    /** Stripe Checkout Session ID — set at funding time, used for webhook lookup. */
    @Column(length = 255)
    private String stripeCheckoutSessionId;

    /** Stripe PaymentIntent ID — populated from webhook after checkout.session.completed. */
    @Column(length = 255)
    private String stripePaymentIntentId;

    /** Platform commission deducted from amount (e.g. 10%). */
    @Column(nullable = false)
    private BigDecimal platformFeeAmount = BigDecimal.ZERO;
    /** Net amount transferred to freelancer on approval = amount - platformFeeAmount. */
    @Column(nullable = false)
    private BigDecimal freelancerPayout = BigDecimal.ZERO;

    /** When the client paid into escrow. */
    private LocalDateTime fundedAt;

    /** When the funds were released to the freelancer. */
    private LocalDateTime releasedAt;

    /** Number of revisions requested — enforces the max-revision cap. */
    @Column(nullable = false)
    private int revisionCount = 0;
}