package com.freelancehub.freelancehub.payment.service;

import com.freelancehub.freelancehub.payment.dto.StripeConnectResponse;
import com.freelancehub.freelancehub.user.domain.Freelancer;
import com.freelancehub.freelancehub.user.repository.FreelancerRepository;
import com.freelancehub.freelancehub.exception.NotFoundException;
import com.stripe.exception.StripeException;
import com.stripe.model.Account;
import com.stripe.model.AccountLink;
import com.stripe.param.AccountCreateParams;
import com.stripe.param.AccountLinkCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class StripeConnectService {

    private final FreelancerRepository freelancerRepository;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    // ── Start onboarding ──────────────────────────────────────────────────────

    @Transactional
    public StripeConnectResponse startOnboarding(String freelancerId) {
        Freelancer freelancer = freelancerRepository.findById(freelancerId)
                .orElseThrow(() -> new NotFoundException("Freelancer not found: " + freelancerId));

        if (freelancer.isStripeOnboarded()) {
            return StripeConnectResponse.alreadyOnboarded();
        }

        try {
            String accountId = freelancer.getStripeAccountId();
            if (accountId == null) {
                AccountCreateParams params = AccountCreateParams.builder()
                        .setType(AccountCreateParams.Type.EXPRESS)
                        .setEmail(freelancer.getEmail())
                        .putMetadata("freelancerId", freelancerId)
                        .build();

                Account account = Account.create(params);
                accountId = account.getId();

                freelancer.setStripeAccountId(accountId);
                freelancerRepository.save(freelancer);
                log.info("Created Stripe Express account {} for freelancer {}", accountId, freelancerId);
            }

            AccountLinkCreateParams linkParams = AccountLinkCreateParams.builder()
                    .setAccount(accountId)
                    .setRefreshUrl(frontendUrl + "/settings?stripe=refresh")
                    .setReturnUrl(frontendUrl  + "/settings?stripe=success")
                    .setType(AccountLinkCreateParams.Type.ACCOUNT_ONBOARDING)
                    .build();

            AccountLink link = AccountLink.create(linkParams);
            return StripeConnectResponse.withUrl(link.getUrl());

        } catch (StripeException e) {
            log.error("Stripe Connect error for freelancer {}: {}", freelancerId, e.getMessage());
            throw new RuntimeException("Stripe onboarding error: " + e.getMessage(), e);
        }
    }

    // ── Mark onboarded (called by webhook) ───────────────────────────────────

    @Transactional
    public void markOnboarded(String stripeAccountId) {
        freelancerRepository.findByStripeAccountId(stripeAccountId).ifPresent(f -> {
            f.setStripeOnboarded(true);
            freelancerRepository.save(f);
            log.info("Freelancer {} marked as Stripe onboarded (via webhook)", f.getId());
        });
    }

    // ── Get status (DB cache + Stripe fallback) ───────────────────────────────
    //
    //  Primary: read the DB flag (fast, no Stripe API call).
    //  Fallback: if flag is false but an accountId exists, ask Stripe directly.
    //  This covers the local dev case where webhooks can't reach localhost,
    //  and any production case where the account.updated webhook was missed.

    @Transactional
    public boolean isOnboarded(String freelancerId) {
        Freelancer freelancer = freelancerRepository.findById(freelancerId)
                .orElseThrow(() -> new NotFoundException("Freelancer not found: " + freelancerId));

        // Fast path — DB flag already set
        if (freelancer.isStripeOnboarded()) return true;

        // No Stripe account created yet
        String accountId = freelancer.getStripeAccountId();
        if (accountId == null) return false;

        // Fallback: verify directly with Stripe
        try {
            Account account = Account.retrieve(accountId);
            boolean verified = Boolean.TRUE.equals(account.getChargesEnabled())
                    && Boolean.TRUE.equals(account.getPayoutsEnabled());

            if (verified) {
                // Self-heal: write flag so the next call takes the fast path
                freelancer.setStripeOnboarded(true);
                freelancerRepository.save(freelancer);
                log.info("Self-healed Stripe onboarding flag for freelancer {} (account {})",
                        freelancerId, accountId);
            }

            return verified;

        } catch (StripeException e) {
            log.error("Stripe account retrieval failed for freelancer {} (account {}): {}",
                    freelancerId, accountId, e.getMessage());
            return false;
        }
    }
}