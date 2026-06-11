package com.freelancehub.freelancehub.payment.controller;

import com.freelancehub.freelancehub.payment.service.PaymentService;
import com.freelancehub.freelancehub.payment.service.StripeConnectService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Account;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.Refund;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;

/**
 * Stripe sends webhook events asynchronously to this endpoint.
 *
 * Security:
 *   - Signature verified with Stripe-Signature header + webhook secret
 *   - Idempotency: event IDs checked against stripe_event_log
 *   - Endpoint is permitted without authentication in SecurityConfig
 *     (Stripe has no way to include our JWT)
 *
 * Events handled:
 *   - checkout.session.completed → mark milestone FUNDED
 *   - account.updated            → mark freelancer Stripe onboarded
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class StripeWebhookController {

    private final PaymentService paymentService;
    private final StripeConnectService stripeConnectService;

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    @PostMapping(value = "/webhook", consumes = "application/json")
    public ResponseEntity<String> handleWebhook(
            @RequestBody byte[] rawPayload,
            @RequestHeader("Stripe-Signature") String sigHeader
    ) {
        String payload = new String(rawPayload, StandardCharsets.UTF_8);

        // ── 1. Verify signature ───────────────────────────────────────────────
        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            log.warn("Stripe webhook signature verification failed: {}", e.getMessage());
            return ResponseEntity.status(400).body("Invalid signature");
        }

        // ── 2. Idempotency guard ──────────────────────────────────────────────
        if (!paymentService.tryClaimEvent(event.getId(), event.getType())) {
            log.debug("Stripe event {} already claimed — skipping", event.getId());
            return ResponseEntity.ok("Already processed");
        }

        // ── 3. Dispatch ───────────────────────────────────────────────────────
        try {
            switch (event.getType()) {

                case "checkout.session.completed" -> {
                    Session session = deserialize(event, Session.class);
                    paymentService.handleCheckoutCompleted(
                            session.getId(),
                            session.getPaymentIntent(),
                            session.getPaymentStatus(),
                            session.getAmountTotal(),
                            session.getCurrency()
                    );
                }

                case "checkout.session.async_payment_succeeded" -> {
                    Session session = deserialize(event, Session.class);
                    paymentService.handleCheckoutCompleted(
                            session.getId(),
                            session.getPaymentIntent(),
                            "paid",
                            session.getAmountTotal(),
                            session.getCurrency()
                    );
                }

                case "checkout.session.expired", "checkout.session.async_payment_failed" -> {
                    Session session = deserialize(event, Session.class);
                    paymentService.handleCheckoutExpired(session.getId());
                }

                case "refund.created", "refund.updated", "refund.failed" -> {
                    Refund refund = deserialize(event, Refund.class);
                    paymentService.handleRefundUpdated(refund.getId(), refund.getStatus());
                }

                case "account.updated" -> {
                    Account account = deserialize(event, Account.class);
                    stripeConnectService.updateOnboardingStatus(
                            account.getId(),
                            Boolean.TRUE.equals(account.getChargesEnabled())
                                    && Boolean.TRUE.equals(account.getPayoutsEnabled())
                    );
                }

                default -> log.debug("Unhandled Stripe event type: {}", event.getType());
            }

            // ── 4. Mark processed (idempotency) ──────────────────────────────
            paymentService.markEventProcessed(event.getId());

        } catch (Exception e) {
            paymentService.releaseEventClaim(event.getId());
            log.error("Error processing Stripe event {} ({}): {}",
                    event.getId(), event.getType(), e.getMessage(), e);
            // Return 500 → Stripe will retry (exponential backoff, up to 3 days)
            return ResponseEntity.status(500).body("Processing error");
        }

        return ResponseEntity.ok("OK");
    }

    // ── Deserialize helper ────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private <T> T deserialize(Event event, Class<T> type) {
        EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
        if (deserializer.getObject().isPresent()) {
            return (T) deserializer.getObject().get();
        }
        try {
            return (T) deserializer.deserializeUnsafe();
        } catch (Exception e) {
            throw new RuntimeException(
                    "Failed to deserialize Stripe event object for: " + event.getId(), e);
        }
    }
}
