package com.freelancehub.freelancehub.payment.service;

import com.freelancehub.freelancehub.bid.domain.Bid;
import com.freelancehub.freelancehub.contract.domain.Contract;
import com.freelancehub.freelancehub.contract.domain.Milestone;
import com.freelancehub.freelancehub.contract.domain.MilestoneStatus;
import com.freelancehub.freelancehub.contract.repository.MilestoneRepository;
import com.freelancehub.freelancehub.exception.NotFoundException;
import com.freelancehub.freelancehub.exception.UnauthorizedException;
import com.freelancehub.freelancehub.notification.domain.NotificationType;
import com.freelancehub.freelancehub.notification.domain.ReferenceType;
import com.freelancehub.freelancehub.notification.service.NotificationService;
import com.freelancehub.freelancehub.payment.domain.StripeEventLog;
import com.freelancehub.freelancehub.payment.domain.RefundStatus;
import com.freelancehub.freelancehub.payment.dto.CheckoutSessionResponse;
import com.freelancehub.freelancehub.payment.repository.StripeEventLogRepository;
import com.freelancehub.freelancehub.project.domain.Project;
import com.freelancehub.freelancehub.user.domain.Client;
import com.freelancehub.freelancehub.user.domain.Freelancer;
import com.stripe.exception.ApiException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.model.Transfer;
import com.stripe.model.checkout.Session;
import com.stripe.net.RequestOptions;
import com.stripe.param.RefundCreateParams;
import com.stripe.param.TransferCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private MilestoneRepository milestoneRepository;

    @Mock
    private StripeEventLogRepository eventLogRepository;

    @Mock
    private NotificationService notificationService;

    private PaymentService paymentService;

    @BeforeEach
    void setUp() {
        paymentService = new PaymentService(milestoneRepository, eventLogRepository, notificationService);
        setField("frontendUrl", "http://localhost:3000");
        setField("platformFeePercent", 12.5d);
    }

    @Test
    void fundMilestone_whenClientOwnsPendingMilestone_createsCheckoutAndStoresFeeBreakdown() {
        Milestone milestone = milestone("ms-1", "123.45", MilestoneStatus.PENDING);
        when(milestoneRepository.findByIdForUpdate("ms-1")).thenReturn(Optional.of(milestone));

        Session session = new Session();
        session.setId("cs_test_123");
        session.setUrl("https://checkout.stripe.test/session");

        AtomicReference<SessionCreateParams> paramsRef = new AtomicReference<>();
        try (MockedStatic<Session> sessions = mockStatic(Session.class)) {
            sessions.when(() -> Session.create(any(SessionCreateParams.class), any(RequestOptions.class))).thenAnswer(invocation -> {
                paramsRef.set(invocation.getArgument(0));
                return session;
            });

            CheckoutSessionResponse response = paymentService.fundMilestone(
                    "ms-1",
                    "client-1",
                    "client@example.com"
            );

            assertThat(response.sessionId()).isEqualTo("cs_test_123");
            assertThat(response.checkoutUrl()).isEqualTo("https://checkout.stripe.test/session");
        }

        assertThat(milestone.getStripeCheckoutSessionId()).isEqualTo("cs_test_123");
        assertThat(milestone.getPlatformFeeAmount()).isEqualByComparingTo("15.43");
        assertThat(milestone.getFreelancerPayout()).isEqualByComparingTo("108.02");

        SessionCreateParams params = paramsRef.get();
        assertThat(params.getCustomerEmail()).isEqualTo("client@example.com");
        assertThat(params.getSuccessUrl()).isEqualTo("http://localhost:3000/client/contracts/contract-1?funded=true&ms=ms-1");
        assertThat(params.getCancelUrl()).isEqualTo("http://localhost:3000/client/contracts/contract-1?funded=false");
        assertThat(params.getMetadata()).containsEntry("milestoneId", "ms-1")
                .containsEntry("contractId", "contract-1")
                .containsEntry("freelancerStripeId", "acct_123");
        assertThat(params.getLineItems()).hasSize(1);
        assertThat(params.getLineItems().getFirst().getPriceData().getUnitAmount()).isEqualTo(12345L);

        verify(milestoneRepository).save(milestone);
    }

    @Test
    void fundMilestone_whenAmountHasFractionalCent_roundsStripeCentsHalfUp() {
        setField("platformFeePercent", 10.0d);
        Milestone milestone = milestone("ms-1", "10.005", MilestoneStatus.PENDING);
        when(milestoneRepository.findByIdForUpdate("ms-1")).thenReturn(Optional.of(milestone));

        Session session = new Session();
        session.setId("cs_test_123");
        session.setUrl("https://checkout.stripe.test/session");

        AtomicReference<SessionCreateParams> paramsRef = new AtomicReference<>();
        try (MockedStatic<Session> sessions = mockStatic(Session.class)) {
            sessions.when(() -> Session.create(any(SessionCreateParams.class), any(RequestOptions.class))).thenAnswer(invocation -> {
                paramsRef.set(invocation.getArgument(0));
                return session;
            });

            paymentService.fundMilestone("ms-1", "client-1", "client@example.com");
        }

        assertThat(paramsRef.get().getLineItems().getFirst().getPriceData().getUnitAmount()).isEqualTo(1001L);
        assertThat(milestone.getPlatformFeeAmount()).isEqualByComparingTo("1.00");
        assertThat(milestone.getFreelancerPayout()).isEqualByComparingTo("9.01");
    }

    @Test
    void fundMilestone_whenCallerIsNotContractClient_throwsUnauthorizedWithoutCallingStripe() {
        Milestone milestone = milestone("ms-1", "100.00", MilestoneStatus.PENDING);
        when(milestoneRepository.findByIdForUpdate("ms-1")).thenReturn(Optional.of(milestone));

        try (MockedStatic<Session> sessions = mockStatic(Session.class)) {
            assertThatThrownBy(() -> paymentService.fundMilestone("ms-1", "client-2", "other@example.com"))
                    .isInstanceOf(UnauthorizedException.class)
                    .hasMessage("Only the contract's client can fund this milestone");

            sessions.verifyNoInteractions();
        }

        verify(milestoneRepository, never()).save(any());
    }

    @Test
    void fundMilestone_whenMilestoneIsNotPending_throwsIllegalState() {
        Milestone milestone = milestone("ms-1", "100.00", MilestoneStatus.FUNDED);
        when(milestoneRepository.findByIdForUpdate("ms-1")).thenReturn(Optional.of(milestone));

        assertThatThrownBy(() -> paymentService.fundMilestone("ms-1", "client-1", "client@example.com"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Only PENDING milestones can be funded. Current status: FUNDED");

        verify(milestoneRepository, never()).save(any());
    }

    @Test
    void fundMilestone_whenFreelancerHasNoStripeAccount_throwsIllegalState() {
        Milestone milestone = milestone("ms-1", "100.00", MilestoneStatus.PENDING);
        milestone.getContract().getBid().getFreelancer().setStripeAccountId(" ");
        when(milestoneRepository.findByIdForUpdate("ms-1")).thenReturn(Optional.of(milestone));

        assertThatThrownBy(() -> paymentService.fundMilestone("ms-1", "client-1", "client@example.com"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("The freelancer has not connected their Stripe account yet. Please ask them to complete onboarding before funding this milestone.");

        verify(milestoneRepository, never()).save(any());
    }

    @Test
    void fundMilestone_whenCheckoutSessionAlreadyExists_rejectsDuplicateChargeAttempt() {
        Milestone milestone = milestone("ms-1", "100.00", MilestoneStatus.PENDING);
        milestone.setStripeCheckoutSessionId("cs_existing");
        when(milestoneRepository.findByIdForUpdate("ms-1")).thenReturn(Optional.of(milestone));

        assertThatThrownBy(() -> paymentService.fundMilestone("ms-1", "client-1", "client@example.com"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("A payment session already exists for this milestone. Complete or cancel it before trying again.");
    }

    @Test
    void handleCheckoutCompleted_whenMilestoneIsPending_marksFundedAndNotifiesFreelancer() {
        Milestone milestone = milestone("ms-1", "100.00", MilestoneStatus.PENDING);
        when(milestoneRepository.findByStripeCheckoutSessionId("cs_test_123")).thenReturn(Optional.of(milestone));

        paymentService.handleCheckoutCompleted("cs_test_123", "pi_123", "paid", 10000L, "usd");

        assertThat(milestone.getStatus()).isEqualTo(MilestoneStatus.FUNDED);
        assertThat(milestone.getStripePaymentIntentId()).isEqualTo("pi_123");
        assertThat(milestone.getFundedAt()).isNotNull();
        verify(milestoneRepository).save(milestone);
        verify(notificationService).notifyWithEmail(
                eq("freelancer-1"),
                eq("freelancer@example.com"),
                eq(NotificationType.MILESTONE_FUNDED),
                eq("Milestone funded — you can start working"),
                eq("\"Milestone One\" on project \"Project One\" has been funded."),
                eq("ms-1"),
                eq(ReferenceType.MILESTONE),
                eq("Milestone funded"),
                any(String.class)
        );
    }

    @Test
    void handleCheckoutCompleted_whenMilestoneAlreadyFunded_isIdempotentNoop() {
        Milestone milestone = milestone("ms-1", "100.00", MilestoneStatus.FUNDED);
        when(milestoneRepository.findByStripeCheckoutSessionId("cs_test_123")).thenReturn(Optional.of(milestone));

        paymentService.handleCheckoutCompleted("cs_test_123", "pi_123", "paid", 10000L, "usd");

        verify(milestoneRepository, never()).save(any());
        verifyNoInteractions(notificationService);
    }

    @Test
    void handleCheckoutCompleted_whenSessionUnknown_throwsNotFound() {
        when(milestoneRepository.findByStripeCheckoutSessionId("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> paymentService.handleCheckoutCompleted("missing", "pi_123", "paid", 10000L, "usd"))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("No milestone found for Stripe session: missing");
    }

    @Test
    void handleCheckoutCompleted_whenPaymentIsUnpaid_leavesMilestonePending() {
        Milestone milestone = milestone("ms-1", "100.00", MilestoneStatus.PENDING);
        when(milestoneRepository.findByStripeCheckoutSessionId("cs_test_123")).thenReturn(Optional.of(milestone));

        paymentService.handleCheckoutCompleted("cs_test_123", "pi_123", "unpaid", 10000L, "usd");

        assertThat(milestone.getStatus()).isEqualTo(MilestoneStatus.PENDING);
        verify(milestoneRepository, never()).save(any());
    }

    @Test
    void handleCheckoutCompleted_whenAmountDoesNotMatch_rejectsEvent() {
        Milestone milestone = milestone("ms-1", "100.00", MilestoneStatus.PENDING);
        when(milestoneRepository.findByStripeCheckoutSessionId("cs_test_123")).thenReturn(Optional.of(milestone));

        assertThatThrownBy(() ->
                paymentService.handleCheckoutCompleted("cs_test_123", "pi_123", "paid", 9999L, "usd"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Stripe payment amount or currency does not match the milestone");
    }

    @Test
    void handleCheckoutExpired_whenPending_clearsActiveSession() {
        Milestone milestone = milestone("ms-1", "100.00", MilestoneStatus.PENDING);
        milestone.setStripeCheckoutSessionId("cs_test_123");
        when(milestoneRepository.findByStripeCheckoutSessionId("cs_test_123")).thenReturn(Optional.of(milestone));

        paymentService.handleCheckoutExpired("cs_test_123");

        assertThat(milestone.getStripeCheckoutSessionId()).isNull();
        verify(milestoneRepository).save(milestone);
    }

    @Test
    void releasePayment_whenStripeTransferSucceeds_usesPayoutCentsAndIdempotencyKey() {
        Milestone milestone = milestone("ms-1", "100.00", MilestoneStatus.APPROVED);
        milestone.setFreelancerPayout(new BigDecimal("12.345"));
        milestone.setStripePaymentIntentId("pi_123");

        PaymentIntent paymentIntent = new PaymentIntent();
        paymentIntent.setId("pi_123");
        paymentIntent.setLatestCharge("ch_123");
        Transfer transfer = new Transfer();
        transfer.setId("tr_123");

        AtomicReference<TransferCreateParams> paramsRef = new AtomicReference<>();
        AtomicReference<RequestOptions> optionsRef = new AtomicReference<>();

        try (MockedStatic<PaymentIntent> paymentIntents = mockStatic(PaymentIntent.class);
             MockedStatic<Transfer> transfers = mockStatic(Transfer.class)) {
            paymentIntents.when(() -> PaymentIntent.retrieve("pi_123")).thenReturn(paymentIntent);
            transfers.when(() -> Transfer.create(any(TransferCreateParams.class), any(RequestOptions.class)))
                    .thenAnswer(invocation -> {
                        paramsRef.set(invocation.getArgument(0));
                        optionsRef.set(invocation.getArgument(1));
                        return transfer;
                    });

            paymentService.releasePayment(milestone);
        }

        assertThat(milestone.getReleasedAt()).isNotNull();
        assertThat(paramsRef.get().getAmount()).isEqualTo(1235L);
        assertThat(paramsRef.get().getCurrency()).isEqualTo("usd");
        assertThat(paramsRef.get().getDestination()).isEqualTo("acct_123");
        assertThat(paramsRef.get().getSourceTransaction()).isEqualTo("ch_123");
        assertThat(paramsRef.get().getMetadata()).containsEntry("milestoneId", "ms-1")
                .containsEntry("contractId", "contract-1");
        assertThat(optionsRef.get().getIdempotencyKey()).isEqualTo("release_ms_ms-1");
        verify(milestoneRepository).save(milestone);
    }

    @Test
    void releasePayment_whenStripeFails_doesNotSaveRelease() {
        Milestone milestone = milestone("ms-1", "100.00", MilestoneStatus.APPROVED);
        milestone.setFreelancerPayout(new BigDecimal("90.00"));
        milestone.setStripePaymentIntentId("pi_123");

        try (MockedStatic<PaymentIntent> paymentIntents = mockStatic(PaymentIntent.class)) {
            paymentIntents.when(() -> PaymentIntent.retrieve("pi_123"))
                    .thenThrow(new ApiException("stripe down", "req_123", null, 500, null));

            assertThatThrownBy(() -> paymentService.releasePayment(milestone))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Payout failed: stripe down");
        }

        assertThat(milestone.getReleasedAt()).isNull();
        verify(milestoneRepository, never()).save(any());
    }

    @Test
    void refundPayment_whenNoPaymentIntent_failsLoudly() {
        Milestone milestone = milestone("ms-1", "100.00", MilestoneStatus.FUNDED);
        milestone.setStripePaymentIntentId(null);

        assertThatThrownBy(() -> paymentService.refundPayment(milestone))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Cannot refund a funded milestone without a confirmed PaymentIntent");

        assertThat(milestone.getStatus()).isEqualTo(MilestoneStatus.FUNDED);
        verify(milestoneRepository, never()).save(any());
        verifyNoInteractions(notificationService);
    }

    @Test
    void refundPayment_whenStripeRefundSucceeds_marksRefundedAndUsesIdempotencyKey() {
        Milestone milestone = milestone("ms-1", "100.00", MilestoneStatus.FUNDED);
        milestone.setStripePaymentIntentId("pi_123");

        Refund refund = new Refund();
        refund.setId("re_123");
        refund.setStatus("succeeded");

        AtomicReference<RefundCreateParams> paramsRef = new AtomicReference<>();
        AtomicReference<RequestOptions> optionsRef = new AtomicReference<>();

        try (MockedStatic<Refund> refunds = mockStatic(Refund.class)) {
            refunds.when(() -> Refund.create(any(RefundCreateParams.class), any(RequestOptions.class)))
                    .thenAnswer(invocation -> {
                        paramsRef.set(invocation.getArgument(0));
                        optionsRef.set(invocation.getArgument(1));
                        return refund;
                    });

            paymentService.refundPayment(milestone);
        }

        assertThat(milestone.getStatus()).isEqualTo(MilestoneStatus.REFUNDED);
        assertThat(milestone.getStripeRefundId()).isEqualTo("re_123");
        assertThat(paramsRef.get().getPaymentIntent()).isEqualTo("pi_123");
        assertThat(optionsRef.get().getIdempotencyKey()).isEqualTo("refund_ms_ms-1");
        verify(milestoneRepository).save(milestone);
        verify(notificationService).notifyWithEmail(
                eq("client-1"),
                eq(NotificationType.PAYMENT_REFUNDED),
                eq("Refund processed"),
                eq("Payment for \"Milestone One\" has been refunded."),
                eq("ms-1"),
                eq(ReferenceType.MILESTONE),
                eq("Refund processed"),
                any(String.class)
        );
    }

    @Test
    void refundPayment_whenStripeRefundFails_doesNotSaveOrMutateStatus() {
        Milestone milestone = milestone("ms-1", "100.00", MilestoneStatus.FUNDED);
        milestone.setStripePaymentIntentId("pi_123");

        try (MockedStatic<Refund> refunds = mockStatic(Refund.class)) {
            refunds.when(() -> Refund.create(any(RefundCreateParams.class), any(RequestOptions.class)))
                    .thenThrow(new ApiException("refund failed upstream", "req_123", null, 500, null));

            assertThatThrownBy(() -> paymentService.refundPayment(milestone))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Refund failed: refund failed upstream");
        }

        assertThat(milestone.getStatus()).isEqualTo(MilestoneStatus.FUNDED);
        verify(milestoneRepository, never()).save(any());
        verifyNoInteractions(notificationService);
    }

    @Test
    void refundPayment_whenStripeRefundIsPending_recordsPendingWithoutNotifying() {
        Milestone milestone = milestone("ms-1", "100.00", MilestoneStatus.FUNDED);
        milestone.setStripePaymentIntentId("pi_123");
        Refund refund = new Refund();
        refund.setId("re_123");
        refund.setStatus("pending");

        try (MockedStatic<Refund> refunds = mockStatic(Refund.class)) {
            refunds.when(() -> Refund.create(any(RefundCreateParams.class), any(RequestOptions.class)))
                    .thenReturn(refund);
            paymentService.refundPayment(milestone);
        }

        assertThat(milestone.getStatus()).isEqualTo(MilestoneStatus.FUNDED);
        assertThat(milestone.getRefundStatus()).isEqualTo(RefundStatus.PENDING);
        assertThat(milestone.getStripeRefundId()).isEqualTo("re_123");
        verifyNoInteractions(notificationService);
    }

    @Test
    void handleRefundUpdated_whenPendingRefundSucceeds_marksRefundedAndNotifies() {
        Milestone milestone = milestone("ms-1", "100.00", MilestoneStatus.FUNDED);
        milestone.setStripeRefundId("re_123");
        milestone.setRefundStatus(RefundStatus.PENDING);
        when(milestoneRepository.findByStripeRefundId("re_123")).thenReturn(Optional.of(milestone));

        paymentService.handleRefundUpdated("re_123", "succeeded");

        assertThat(milestone.getStatus()).isEqualTo(MilestoneStatus.REFUNDED);
        assertThat(milestone.getRefundStatus()).isEqualTo(RefundStatus.SUCCEEDED);
        verify(notificationService).notifyWithEmail(
                eq("client-1"), eq(NotificationType.PAYMENT_REFUNDED), any(), any(),
                eq("ms-1"), eq(ReferenceType.MILESTONE), any(), any()
        );
    }

    @Test
    void refundAllFundedMilestones_refundsOnlyRefundableStates() {
        Milestone funded = milestone("funded", "100.00", MilestoneStatus.FUNDED);
        funded.setStripePaymentIntentId("pi_funded");
        Milestone submitted = milestone("submitted", "100.00", MilestoneStatus.SUBMITTED);
        submitted.setStripePaymentIntentId("pi_submitted");
        Milestone revision = milestone("revision", "100.00", MilestoneStatus.REVISION_REQUESTED);
        revision.setStripePaymentIntentId("pi_revision");
        Milestone disputed = milestone("disputed", "100.00", MilestoneStatus.DISPUTED);
        disputed.setStripePaymentIntentId("pi_disputed");
        Milestone pending = milestone("pending", "100.00", MilestoneStatus.PENDING);
        Milestone approved = milestone("approved", "100.00", MilestoneStatus.APPROVED);
        Milestone refunded = milestone("refunded", "100.00", MilestoneStatus.REFUNDED);
        when(milestoneRepository.findByContractId("contract-1"))
                .thenReturn(List.of(funded, submitted, revision, disputed, pending, approved, refunded));

        try (MockedStatic<Refund> refunds = mockStatic(Refund.class)) {
            refunds.when(() -> Refund.create(any(RefundCreateParams.class), any(RequestOptions.class)))
                    .thenAnswer(invocation -> {
                        Refund refund = new Refund();
                        refund.setId("re_" + invocation.getArgument(0, RefundCreateParams.class).getPaymentIntent());
                        refund.setStatus("succeeded");
                        return refund;
                    });

            paymentService.refundAllFundedMilestones("contract-1");
        }

        assertThat(funded.getStatus()).isEqualTo(MilestoneStatus.REFUNDED);
        assertThat(submitted.getStatus()).isEqualTo(MilestoneStatus.REFUNDED);
        assertThat(revision.getStatus()).isEqualTo(MilestoneStatus.REFUNDED);
        assertThat(disputed.getStatus()).isEqualTo(MilestoneStatus.REFUNDED);
        assertThat(pending.getStatus()).isEqualTo(MilestoneStatus.PENDING);
        assertThat(approved.getStatus()).isEqualTo(MilestoneStatus.APPROVED);
        assertThat(refunded.getStatus()).isEqualTo(MilestoneStatus.REFUNDED);
        verify(milestoneRepository).save(funded);
        verify(milestoneRepository).save(submitted);
        verify(milestoneRepository).save(revision);
        verify(milestoneRepository).save(disputed);
        verify(milestoneRepository, never()).save(pending);
        verify(milestoneRepository, never()).save(approved);
    }

    @Test
    void findAndAssertClient_whenClientOwnsFundedMilestone_returnsMilestone() {
        Milestone milestone = milestone("ms-1", "100.00", MilestoneStatus.FUNDED);
        when(milestoneRepository.findById("ms-1")).thenReturn(Optional.of(milestone));

        Milestone result = paymentService.findAndAssertClient("ms-1", "client-1");

        assertThat(result).isSameAs(milestone);
    }

    @Test
    void findAndAssertClient_whenCallerIsNotClient_throwsUnauthorized() {
        Milestone milestone = milestone("ms-1", "100.00", MilestoneStatus.FUNDED);
        when(milestoneRepository.findById("ms-1")).thenReturn(Optional.of(milestone));

        assertThatThrownBy(() -> paymentService.findAndAssertClient("ms-1", "client-2"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Only the client can refund this milestone");
    }

    @Test
    void findAndAssertClient_whenMilestoneIsNotFunded_throwsIllegalState() {
        Milestone milestone = milestone("ms-1", "100.00", MilestoneStatus.SUBMITTED);
        when(milestoneRepository.findById("ms-1")).thenReturn(Optional.of(milestone));

        assertThatThrownBy(() -> paymentService.findAndAssertClient("ms-1", "client-1"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Only FUNDED milestones (not yet submitted) can be refunded directly. Use dispute for submitted milestones.");
    }

    @Test
    void tryClaimEvent_whenInsertSucceeds_returnsTrue() {
        when(eventLogRepository.insertClaim("evt_1", "checkout.session.completed")).thenReturn(1);
        boolean claimed = paymentService.tryClaimEvent("evt_1", "checkout.session.completed");

        assertThat(claimed).isTrue();
        verify(eventLogRepository).insertClaim("evt_1", "checkout.session.completed");
    }

    @Test
    void tryClaimEvent_whenEventAlreadyExists_returnsFalse() {
        when(eventLogRepository.insertClaim("evt_1", "checkout.session.completed")).thenReturn(0);

        boolean claimed = paymentService.tryClaimEvent("evt_1", "checkout.session.completed");

        assertThat(claimed).isFalse();
    }

    @Test
    void markEventProcessed_whenEventExists_marksProcessed() {
        StripeEventLog event = new StripeEventLog("evt_1", "checkout.session.completed");
        when(eventLogRepository.findById("evt_1")).thenReturn(Optional.of(event));

        paymentService.markEventProcessed("evt_1");

        assertThat(event.isProcessed()).isTrue();
        verify(eventLogRepository).save(event);
    }

    @Test
    void markEventProcessed_whenEventIsMissing_doesNothing() {
        when(eventLogRepository.findById("evt_missing")).thenReturn(Optional.empty());

        paymentService.markEventProcessed("evt_missing");

        verify(eventLogRepository, never()).save(any());
    }

    @Test
    void releaseEventClaim_deletesFailedClaimSoStripeCanRetry() {
        paymentService.releaseEventClaim("evt_failed");

        verify(eventLogRepository).deleteById("evt_failed");
    }

    private Milestone milestone(String id, String amount, MilestoneStatus status) {
        Client client = new Client();
        client.setId("client-1");
        client.setName("Client User");
        client.setEmail("client@example.com");

        Freelancer freelancer = new Freelancer();
        freelancer.setId("freelancer-1");
        freelancer.setName("Freelancer User");
        freelancer.setEmail("freelancer@example.com");
        freelancer.setStripeAccountId("acct_123");
        freelancer.setStripeOnboarded(true);

        Project project = new Project();
        project.setId("project-1");
        project.setTitle("Project One");
        project.setClient(client);

        Bid bid = new Bid();
        bid.setId("bid-1");
        bid.setProject(project);
        bid.setFreelancer(freelancer);

        Contract contract = new Contract();
        contract.setId("contract-1");
        contract.setBid(bid);
        contract.setClient(client);
        contract.setFreelancer(freelancer);
        contract.setAgreedPrice(new BigDecimal("1000.00"));
        contract.setStatus(com.freelancehub.freelancehub.contract.domain.ContractStatus.ACTIVE);

        Milestone milestone = new Milestone();
        milestone.setId(id);
        milestone.setContract(contract);
        milestone.setTitle("Milestone One");
        milestone.setAmount(new BigDecimal(amount));
        milestone.setStatus(status);
        milestone.setFreelancerPayout(new BigDecimal("90.00"));
        milestone.setPlatformFeeAmount(new BigDecimal("10.00"));
        return milestone;
    }

    private void setField(String name, Object value) {
        try {
            Field field = PaymentService.class.getDeclaredField(name);
            field.setAccessible(true);
            field.set(paymentService, value);
        } catch (ReflectiveOperationException e) {
            throw new AssertionError("Failed to set field " + name, e);
        }
    }
}
