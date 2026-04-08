package com.freelancehub.freelancehub.payment.controller;

import com.freelancehub.freelancehub.payment.dto.CheckoutSessionResponse;
import com.freelancehub.freelancehub.payment.dto.StripeConnectResponse;
import com.freelancehub.freelancehub.payment.service.PaymentService;
import com.freelancehub.freelancehub.payment.service.StripeConnectService;
import com.freelancehub.freelancehub.user.domain.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final StripeConnectService stripeConnectService;

    // ── POST /api/v1/milestones/{id}/fund ─────────────────────────────────────
    //
    //  Client funds a PENDING milestone.
    //  Returns a Stripe Checkout URL — the frontend does a full-page redirect.

    @PreAuthorize("hasRole('CLIENT')")
    @PostMapping("/milestones/{id}/fund")
    public ResponseEntity<CheckoutSessionResponse> fundMilestone(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser
    ) {
        CheckoutSessionResponse response = paymentService.fundMilestone(
                id,
                currentUser.getId(),
                currentUser.getEmail()
        );
        return ResponseEntity.ok(response);
    }

    // ── POST /api/v1/milestones/{id}/refund ───────────────────────────────────
    //
    //  Client manually refunds a FUNDED milestone that hasn't been submitted yet.
    //  (Once submitted, the client must dispute instead of refunding directly.)

    @PreAuthorize("hasRole('CLIENT')")
    @PostMapping("/milestones/{id}/refund")
    public ResponseEntity<Void> refundMilestone(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser
    ) {
        paymentService.refundPayment(
                paymentService.findAndAssertClient(id, currentUser.getId())
        );
        return ResponseEntity.noContent().build();
    }

    // ── POST /api/v1/stripe/connect/onboard ───────────────────────────────────
    //
    //  Freelancer initiates Stripe Express account onboarding.
    //  Returns a hosted Stripe onboarding URL.

    @PreAuthorize("hasRole('FREELANCER')")
    @PostMapping("/stripe/connect/onboard")
    public ResponseEntity<StripeConnectResponse> startOnboarding(
            @AuthenticationPrincipal User currentUser
    ) {
        StripeConnectResponse response = stripeConnectService.startOnboarding(currentUser.getId());
        return ResponseEntity.ok(response);
    }

    // ── GET /api/v1/stripe/connect/status ────────────────────────────────────

    @PreAuthorize("hasRole('FREELANCER')")
    @GetMapping("/stripe/connect/status")
    public ResponseEntity<Boolean> getConnectStatus(
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(stripeConnectService.isOnboarded(currentUser.getId()));
    }
}