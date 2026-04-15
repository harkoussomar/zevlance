package com.freelancehub.freelancehub.payment.service;

import com.freelancehub.freelancehub.contract.domain.Milestone;
import com.freelancehub.freelancehub.contract.domain.MilestoneStatus;
import com.freelancehub.freelancehub.contract.repository.MilestoneRepository;
import com.freelancehub.freelancehub.exception.NotFoundException;
import com.freelancehub.freelancehub.exception.UnauthorizedException;
import com.freelancehub.freelancehub.notification.domain.NotificationType;
import com.freelancehub.freelancehub.notification.domain.ReferenceType;
import com.freelancehub.freelancehub.notification.service.EmailTemplates;
import com.freelancehub.freelancehub.notification.service.NotificationService;
import com.freelancehub.freelancehub.payment.domain.StripeEventLog;
import com.freelancehub.freelancehub.payment.dto.CheckoutSessionResponse;
import com.freelancehub.freelancehub.payment.repository.StripeEventLogRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.model.Transfer;
import com.stripe.model.checkout.Session;
import com.stripe.param.RefundCreateParams;
import com.stripe.param.TransferCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
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
    //
    //  Flow:
    //    1. Validate milestone is PENDING and freelancer has Stripe account
    //    2. Calculate fee breakdown upfront — stored on milestone so we know
    //       exactly what to transfer on approval (avoids rounding surprises)
    //    3. Create Stripe Checkout Session (hosted page, handles 3DS/Apple Pay)
    //    4. Persist sessionId to milestone for webhook lookup
    //    5. Return checkoutUrl → frontend redirects the user

    @Transactional
    public CheckoutSessionResponse fundMilestone(String milestoneId, String clientId, String clientEmail) {
        Milestone milestone = findById(milestoneId);

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

        String freelancerStripeId = milestone.getContract().getBid()
                .getFreelancer().getStripeAccountId();

        if (freelancerStripeId == null || freelancerStripeId.isBlank()) {
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
                    // Metadata lets the webhook handler find the milestone without
                    // exposing internal DB IDs in the URL.
                    .putMetadata("milestoneId",  milestoneId)
                    .putMetadata("contractId",   contractId)
                    .putMetadata("freelancerStripeId", freelancerStripeId)
                    .build();

            Session session = Session.create(params);

            // Persist fee breakdown and session ID immediately — the webhook
            // will use the session ID to find this milestone.
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
    //
    //  Called by StripeWebhookController after event signature is verified.
    //  Marks the milestone FUNDED and persists the PaymentIntent ID.

    @Transactional
    public void handleCheckoutCompleted(String sessionId, String paymentIntentId) {
        Milestone milestone = milestoneRepository
                .findByStripeCheckoutSessionId(sessionId)
                .orElseThrow(() -> new NotFoundException(
                        "No milestone found for Stripe session: " + sessionId
                ));

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
    // ── Release payment: APPROVED → transfer to freelancer ───────────────────
    //
    //  Called by MilestoneService.approveMilestone after status is set APPROVED.
    //  Creates a Stripe Transfer from the platform account to the freelancer's
    //  connected Express account.

    @Transactional
    public void releasePayment(Milestone milestone) {
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

            Transfer transfer = Transfer.create(params);

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
    //
    //  Called on: contract cancellation (if milestone is FUNDED/SUBMITTED/DISPUTED)
    //  Creates a Stripe Refund against the original PaymentIntent.

    @Transactional
    public void refundPayment(Milestone milestone) {
        if (milestone.getStripePaymentIntentId() == null) {
            log.warn("Refund skipped for milestone {} — no PaymentIntent on record", milestone.getId());
            return;
        }

        try {
            RefundCreateParams params = RefundCreateParams.builder()
                    .setPaymentIntent(milestone.getStripePaymentIntentId())
                    .putMetadata("milestoneId", milestone.getId())
                    .putMetadata("reason", "contract_cancelled")
                    .build();

            Refund.create(params);

            milestone.setStatus(MilestoneStatus.REFUNDED);

            String clientId = milestone.getContract().getBid().getProject().getClient().getId();
            notificationService.notifyWithEmail(
                    clientId, NotificationType.PAYMENT_REFUNDED,
                    "Refund processed",
                    "Payment for \"" + milestone.getTitle() + "\" has been refunded.",
                    milestone.getId(), ReferenceType.MILESTONE,  // ✅ enum instead of string
                    "Refund processed",
                    EmailTemplates.paymentRefunded(
                            milestone.getContract().getBid().getProject().getClient().getName(),
                            milestone.getTitle(),
                            frontendUrl + "/client/contracts/" + milestone.getContract().getId()
                    )
            );

            milestoneRepository.save(milestone);

            log.info("Refunded milestone {} (PaymentIntent {})", milestone.getId(),
                    milestone.getStripePaymentIntentId());

        } catch (StripeException e) {
            log.error("Stripe refund failed for milestone {}: {}", milestone.getId(), e.getMessage());
            throw new RuntimeException("Refund failed: " + e.getMessage(), e);
        }
    }

    // ── Refund all funded milestones for a contract ────────────────────────────
    //
    //  Called when a contract is cancelled. Only refunds milestones that have
    //  been funded but not yet approved (money still in escrow).

    @Transactional
    public void refundAllFundedMilestones(String contractId) {
        List<Milestone> milestones = milestoneRepository.findByContractId(contractId);

        for (Milestone m : milestones) {
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
        return milestone;
    }

    // ── Idempotency check ─────────────────────────────────────────────────────

    @Transactional
    public boolean tryClaimEvent(String eventId, String eventType) {
        try {
            StripeEventLog entry = new StripeEventLog(eventId, eventType);
            entry.setProcessed(false);
            eventLogRepository.saveAndFlush(entry);
            return true;  // we inserted first — we own this event
        } catch (DataIntegrityViolationException e) {
            return false; // another thread already inserted — skip
        }
    }

    // And a separate method to mark it done after processing succeeds:
    @Transactional
    public void markEventProcessed(String eventId) {
        eventLogRepository.findById(eventId).ifPresent(entry -> {
            entry.setProcessed(true);
            eventLogRepository.save(entry);
        });
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Milestone findById(String id) {
        return milestoneRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Milestone not found: " + id));
    }

    private static long toCents(BigDecimal amount) {
        return amount.multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .longValueExact();
    }
}