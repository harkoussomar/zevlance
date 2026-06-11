package com.freelancehub.freelancehub.payment.service;

import com.freelancehub.freelancehub.contract.domain.Milestone;
import com.freelancehub.freelancehub.contract.domain.MilestoneStatus;
import com.freelancehub.freelancehub.contract.domain.ContractStatus;
import com.freelancehub.freelancehub.contract.repository.MilestoneRepository;
import com.freelancehub.freelancehub.exception.NotFoundException;
import com.freelancehub.freelancehub.exception.UnauthorizedException;
import com.freelancehub.freelancehub.notification.domain.NotificationType;
import com.freelancehub.freelancehub.notification.domain.ReferenceType;
import com.freelancehub.freelancehub.notification.service.EmailTemplates;
import com.freelancehub.freelancehub.notification.service.NotificationService;
import com.freelancehub.freelancehub.payment.domain.RefundStatus;
import com.freelancehub.freelancehub.payment.dto.CheckoutSessionResponse;
import com.freelancehub.freelancehub.payment.repository.StripeEventLogRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.model.Transfer;
import com.stripe.model.checkout.Session;
import com.stripe.net.RequestOptions;
import com.stripe.param.RefundCreateParams;
import com.stripe.param.TransferCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.Instant;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final MilestoneRepository milestoneRepository;
    private final StripeEventLogRepository eventLogRepository;
    private final NotificationService notificationService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${stripe.platform-fee-percent:10.0}")
    private double platformFeePercent;

    // ── Fund milestone: create Stripe Checkout Session ────────────────────────

    @Transactional
    public CheckoutSessionResponse fundMilestone(String milestoneId, String clientId, String clientEmail) {
        Milestone milestone = findByIdForUpdate(milestoneId);

        String contractClientId = milestone.getContract().getBid()
                .getProject().getClient().getId();
        if (!contractClientId.equals(clientId)) {
            throw new UnauthorizedException("Only the contract's client can fund this milestone");
        }

        if (milestone.getStatus() != MilestoneStatus.PENDING) {
            throw new IllegalStateException(
                    "Only PENDING milestones can be funded. Current status: " + milestone.getStatus()
            );
        }

        assertActiveContract(milestone);

        if (milestone.getStripeCheckoutSessionId() != null) {
            throw new IllegalStateException(
                    "A payment session already exists for this milestone. Complete or cancel it before trying again."
            );
        }

        String freelancerStripeId = milestone.getContract().getBid()
                .getFreelancer().getStripeAccountId();

        if (freelancerStripeId == null || freelancerStripeId.isBlank()
                || !milestone.getContract().getBid().getFreelancer().isStripeOnboarded()) {
            throw new IllegalStateException(
                    "The freelancer has not connected their Stripe account yet. " +
                            "Please ask them to complete onboarding before funding this milestone."
            );
        }

        BigDecimal feePercent = BigDecimal.valueOf(platformFeePercent).divide(BigDecimal.valueOf(100), 10, RoundingMode.HALF_UP);
        BigDecimal fee        = milestone.getAmount().multiply(feePercent).setScale(2, RoundingMode.HALF_UP);
        BigDecimal payout     = milestone.getAmount().subtract(fee).setScale(2, RoundingMode.HALF_UP);
        long       cents      = toCents(milestone.getAmount());

        String contractId = milestone.getContract().getId();
        String projectTitle = milestone.getContract().getBid().getProject().getTitle();

        try {
            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setExpiresAt(Instant.now().plusSeconds(30 * 60).getEpochSecond())
                    .setCustomerEmail(clientEmail)
                    .setSuccessUrl(frontendUrl + "/client/contracts/" + contractId + "?funded=true&ms=" + milestoneId)
                    .setCancelUrl(frontendUrl  + "/client/contracts/" + contractId + "?funded=false")
                    .addLineItem(SessionCreateParams.LineItem.builder()
                            .setQuantity(1L)
                            .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                    .setCurrency("usd")
                                    .setUnitAmount(cents)
                                    .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                            .setName("Milestone: " + milestone.getTitle())
                                            .setDescription("Project: " + projectTitle)
                                            .build())
                                    .build())
                            .build())
                    .putMetadata("milestoneId",  milestoneId)
                    .putMetadata("contractId",   contractId)
                    .putMetadata("freelancerStripeId", freelancerStripeId)
                    .build();

            RequestOptions options = RequestOptions.builder()
                    .setIdempotencyKey("checkout_ms_" + milestoneId + "_v" + milestone.getVersion())
                    .build();
            Session session = Session.create(params, options);

            milestone.setStripeCheckoutSessionId(session.getId());
            milestone.setPlatformFeeAmount(fee);
            milestone.setFreelancerPayout(payout);
            milestoneRepository.save(milestone);

            log.info("Created Stripe checkout session {} for milestone {}", session.getId(), milestoneId);
            return new CheckoutSessionResponse(session.getUrl(), session.getId());

        } catch (StripeException e) {
            log.error("Stripe error creating checkout session for milestone {}: {}", milestoneId, e.getMessage());
            throw new RuntimeException("Payment provider error: " + e.getMessage(), e);
        }
    }

    // ── Handle webhook: checkout.session.completed ────────────────────────────

    @Transactional
    public void handleCheckoutCompleted(
            String sessionId,
            String paymentIntentId,
            String paymentStatus,
            Long amountTotal,
            String currency
    ) {
        Milestone milestone = milestoneRepository
                .findByStripeCheckoutSessionId(sessionId)
                .orElseThrow(() -> new NotFoundException(
                        "No milestone found for Stripe session: " + sessionId
                ));

        if (!"paid".equals(paymentStatus)) {
            log.info("Checkout session {} completed without confirmed payment; awaiting payment success", sessionId);
            return;
        }

        if (amountTotal == null || amountTotal != toCents(milestone.getAmount())
                || !"usd".equalsIgnoreCase(currency)) {
            throw new IllegalStateException("Stripe payment amount or currency does not match the milestone");
        }

        if (paymentIntentId == null || paymentIntentId.isBlank()) {
            throw new IllegalStateException("Paid Stripe checkout session has no PaymentIntent");
        }

        if (milestone.getStatus() != MilestoneStatus.PENDING) {
            log.warn("Milestone {} already past PENDING when checkout.completed fired", milestone.getId());
            return;
        }

        milestone.setStatus(MilestoneStatus.FUNDED);
        milestone.setStripePaymentIntentId(paymentIntentId);
        milestone.setFundedAt(LocalDateTime.now());
        milestoneRepository.save(milestone);

        String freelancerId    = milestone.getContract().getBid().getFreelancer().getId();
        String freelancerEmail = milestone.getContract().getBid().getFreelancer().getEmail();
        String freelancerName  = milestone.getContract().getBid().getFreelancer().getName();
        String contractId      = milestone.getContract().getId();
        String projectTitle    = milestone.getContract().getBid().getProject().getTitle();

        notificationService.notifyWithEmail(
                freelancerId,
                freelancerEmail,
                NotificationType.MILESTONE_FUNDED,
                "Milestone funded — you can start working",
                "\"" + milestone.getTitle() + "\" on project \"" + projectTitle + "\" has been funded.",
                milestone.getId(),
                ReferenceType.MILESTONE,
                "Milestone funded",
                EmailTemplates.milestoneFunded(
                        freelancerName,
                        milestone.getTitle(),
                        projectTitle,
                        frontendUrl + "/freelancer/contracts/" + contractId
                )
        );

        log.info("Milestone {} FUNDED via session {}", milestone.getId(), sessionId);
    }

    @Transactional
    public void handleCheckoutExpired(String sessionId) {
        milestoneRepository.findByStripeCheckoutSessionId(sessionId).ifPresent(milestone -> {
            if (milestone.getStatus() == MilestoneStatus.PENDING) {
                milestone.setStripeCheckoutSessionId(null);
                milestoneRepository.save(milestone);
            }
        });
    }

    // ── Release payment: APPROVED → transfer to freelancer ───────────────────

    @Transactional
    public void releasePayment(Milestone milestone) {
        assertActiveOrDisputedContract(milestone);
        if (milestone.getStripeTransferId() != null) {
            return;
        }
        if (milestone.getStripePaymentIntentId() == null) {
            throw new IllegalStateException("Cannot release payment without a confirmed PaymentIntent");
        }

        String stripeAccountId = milestone.getContract().getBid()
                .getFreelancer().getStripeAccountId();

        long payoutCents = toCents(milestone.getFreelancerPayout());

        try {
            PaymentIntent pi = PaymentIntent.retrieve(milestone.getStripePaymentIntentId());
            String chargeId = pi.getLatestCharge();

            TransferCreateParams params = TransferCreateParams.builder()
                    .setAmount(payoutCents)
                    .setCurrency("usd")
                    .setDestination(stripeAccountId)
                    .setSourceTransaction(chargeId)
                    .putMetadata("milestoneId", milestone.getId())
                    .putMetadata("contractId",  milestone.getContract().getId())
                    .build();

            // ✅ SECURITY FIX: Idempotency Key
            // If the database rolls back after this Stripe call, Stripe will remember
            // this key and prevent double-paying if the action is retried.
            RequestOptions options = RequestOptions.builder()
                    .setIdempotencyKey("release_ms_" + milestone.getId())
                    .build();

            Transfer transfer = Transfer.create(params, options);

            milestone.setStripeTransferId(transfer.getId());
            milestone.setReleasedAt(LocalDateTime.now());
            milestoneRepository.save(milestone);

            log.info("Released {} cents to {} for milestone {} — transfer {}",
                    payoutCents, stripeAccountId, milestone.getId(), transfer.getId());

        } catch (StripeException e) {
            log.error("Stripe transfer failed for milestone {}: {}", milestone.getId(), e.getMessage());
            throw new RuntimeException("Payout failed: " + e.getMessage(), e);
        }
    }

    // ── Refund payment: return funds to client ────────────────────────────────

    @Transactional
    public void refundPayment(Milestone milestone) {
        if (milestone.getStripePaymentIntentId() == null) {
            throw new IllegalStateException("Cannot refund a funded milestone without a confirmed PaymentIntent");
        }
        if (milestone.getStripeRefundId() != null) {
            throw new IllegalStateException("A refund has already been initiated for this milestone");
        }
        if (milestone.getStripeTransferId() != null) {
            throw new IllegalStateException("Cannot refund a milestone after its payout was released");
        }

        try {
            RefundCreateParams params = RefundCreateParams.builder()
                    .setPaymentIntent(milestone.getStripePaymentIntentId())
                    .putMetadata("milestoneId", milestone.getId())
                    .putMetadata("reason", "contract_cancelled_or_refunded")
                    .build();

            // ✅ SECURITY FIX: Idempotency Key
            // Ensures we never double-refund the client if a network timeout occurs.
            RequestOptions options = RequestOptions.builder()
                    .setIdempotencyKey("refund_ms_" + milestone.getId())
                    .build();

            Refund refund = Refund.create(params, options);
            milestone.setStripeRefundId(refund.getId());
            applyRefundStatus(milestone, refund.getStatus());
            milestoneRepository.save(milestone);

            if (milestone.getRefundStatus() == RefundStatus.SUCCEEDED) {
                notifyRefundSucceeded(milestone);
            }

            log.info("Refunded milestone {} (PaymentIntent {})", milestone.getId(),
                    milestone.getStripePaymentIntentId());

        } catch (StripeException e) {
            log.error("Stripe refund failed for milestone {}: {}", milestone.getId(), e.getMessage());
            throw new RuntimeException("Refund failed: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void handleRefundUpdated(String refundId, String status) {
        Milestone milestone = milestoneRepository.findByStripeRefundId(refundId)
                .orElseThrow(() -> new NotFoundException("No milestone found for Stripe refund: " + refundId));
        RefundStatus previous = milestone.getRefundStatus();
        applyRefundStatus(milestone, status);
        milestoneRepository.save(milestone);
        if (previous != RefundStatus.SUCCEEDED && milestone.getRefundStatus() == RefundStatus.SUCCEEDED) {
            notifyRefundSucceeded(milestone);
        }
    }

    // ── Refund all funded milestones for a contract ────────────────────────────

    @Transactional
    public void refundAllFundedMilestones(String contractId) {
        List<Milestone> milestones = milestoneRepository.findByContractId(contractId);

        for (Milestone m : milestones) {
            // Note: ContractService.cancelContract already strictly prevents this method
            // from running if any milestone is SUBMITTED, REVISION_REQUESTED, or DISPUTED.
            // This is just a secondary safety net.
            boolean refundable = m.getStatus() == MilestoneStatus.FUNDED
                    || m.getStatus() == MilestoneStatus.SUBMITTED
                    || m.getStatus() == MilestoneStatus.REVISION_REQUESTED
                    || m.getStatus() == MilestoneStatus.DISPUTED;

            if (refundable) {
                refundPayment(m);
            }
        }
    }

    @Transactional(readOnly = true)
    public Milestone findAndAssertClient(String milestoneId, String clientId) {
        Milestone milestone = findById(milestoneId);
        String contractClientId = milestone.getContract()
                .getBid().getProject().getClient().getId();
        if (!contractClientId.equals(clientId)) {
            throw new UnauthorizedException("Only the client can refund this milestone");
        }
        if (milestone.getStatus() != MilestoneStatus.FUNDED) {
            throw new IllegalStateException(
                    "Only FUNDED milestones (not yet submitted) can be refunded directly. " +
                            "Use dispute for submitted milestones."
            );
        }
        assertActiveContract(milestone);
        return milestone;
    }

    // ── Idempotency check for Webhooks ────────────────────────────────────────

    @Transactional
    public boolean tryClaimEvent(String eventId, String eventType) {
        return eventLogRepository.insertClaim(eventId, eventType) == 1;
    }

    @Transactional
    public void markEventProcessed(String eventId) {
        eventLogRepository.findById(eventId).ifPresent(entry -> {
            entry.setProcessed(true);
            eventLogRepository.save(entry);
        });
    }

    @Transactional
    public void releaseEventClaim(String eventId) {
        eventLogRepository.deleteById(eventId);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Milestone findById(String id) {
        return milestoneRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Milestone not found: " + id));
    }

    private Milestone findByIdForUpdate(String id) {
        return milestoneRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new NotFoundException("Milestone not found: " + id));
    }

    private void assertActiveContract(Milestone milestone) {
        if (milestone.getContract().getStatus() != ContractStatus.ACTIVE) {
            throw new IllegalStateException("Payment actions are only allowed on ACTIVE contracts");
        }
    }

    private void assertActiveOrDisputedContract(Milestone milestone) {
        ContractStatus status = milestone.getContract().getStatus();
        if (status != ContractStatus.ACTIVE && status != ContractStatus.DISPUTED) {
            throw new IllegalStateException("Payment release is only allowed on ACTIVE or DISPUTED contracts");
        }
    }

    private void applyRefundStatus(Milestone milestone, String stripeStatus) {
        if ("succeeded".equals(stripeStatus)) {
            milestone.setRefundStatus(RefundStatus.SUCCEEDED);
            milestone.setStatus(MilestoneStatus.REFUNDED);
        } else if ("failed".equals(stripeStatus) || "canceled".equals(stripeStatus)) {
            milestone.setRefundStatus(RefundStatus.FAILED);
        } else {
            milestone.setRefundStatus(RefundStatus.PENDING);
        }
    }

    private void notifyRefundSucceeded(Milestone milestone) {
        String clientId = milestone.getContract().getBid().getProject().getClient().getId();
        notificationService.notifyWithEmail(
                clientId, NotificationType.PAYMENT_REFUNDED,
                "Refund processed",
                "Payment for \"" + milestone.getTitle() + "\" has been refunded.",
                milestone.getId(), ReferenceType.MILESTONE,
                "Refund processed",
                EmailTemplates.paymentRefunded(
                        milestone.getContract().getBid().getProject().getClient().getName(),
                        milestone.getTitle(),
                        frontendUrl + "/client/contracts/" + milestone.getContract().getId()
                )
        );
    }

    private static long toCents(BigDecimal amount) {
        return amount.multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .longValueExact();
    }
}
