package com.freelancehub.freelancehub.contract.service;

import com.freelancehub.freelancehub.bid.domain.Bid;
import com.freelancehub.freelancehub.contract.domain.Contract;
import com.freelancehub.freelancehub.contract.domain.ContractStatus;
import com.freelancehub.freelancehub.contract.domain.Milestone;
import com.freelancehub.freelancehub.contract.domain.MilestoneStatus;
import com.freelancehub.freelancehub.contract.dto.CreateMilestoneRequest;
import com.freelancehub.freelancehub.contract.dto.MilestoneResponse;
import com.freelancehub.freelancehub.contract.dto.SubmitDeliverableRequest;
import com.freelancehub.freelancehub.contract.repository.MilestoneRepository;
import com.freelancehub.freelancehub.exception.NotFoundException;
import com.freelancehub.freelancehub.exception.UnauthorizedException;
import com.freelancehub.freelancehub.notification.domain.NotificationType;
import com.freelancehub.freelancehub.notification.domain.ReferenceType;
import com.freelancehub.freelancehub.notification.service.NotificationService;
import com.freelancehub.freelancehub.payment.service.PaymentService;
import com.freelancehub.freelancehub.project.domain.Project;
import com.freelancehub.freelancehub.user.domain.Client;
import com.freelancehub.freelancehub.user.domain.Freelancer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MilestoneServiceTest {

    @Mock
    private MilestoneRepository milestoneRepository;

    @Mock
    private ContractService contractService;

    @Mock
    private PaymentService paymentService;

    @Mock
    private NotificationService notificationService;

    private MilestoneService milestoneService;

    @BeforeEach
    void setUp() {
        milestoneService = new MilestoneService(
                milestoneRepository,
                contractService,
                paymentService,
                notificationService
        );
        setField("frontendUrl", "http://localhost:3000");
        lenient().when(contractService.findContractByIdForUpdate(anyString()))
                .thenAnswer(invocation -> contractService.findContractById(invocation.getArgument(0)));
    }

    @Test
    void createMilestone_whenClientOwnsActiveContractAndBudgetAvailable_savesPendingMilestone() {
        Contract contract = contract("contract-1", ContractStatus.ACTIVE, "500.00");
        when(contractService.findContractById("contract-1")).thenReturn(contract);
        when(milestoneRepository.findByContractId("contract-1")).thenReturn(List.of(
                milestone(contract, "approved", "200.00", MilestoneStatus.APPROVED),
                milestone(contract, "refunded", "300.00", MilestoneStatus.REFUNDED)
        ));
        CreateMilestoneRequest request = createRequest("Final delivery", "Release package", "300.00");

        MilestoneResponse response = milestoneService.createMilestone("contract-1", request, "client-1");

        ArgumentCaptor<Milestone> captor = ArgumentCaptor.forClass(Milestone.class);
        verify(milestoneRepository).save(captor.capture());
        Milestone saved = captor.getValue();
        assertThat(saved.getContract()).isSameAs(contract);
        assertThat(saved.getTitle()).isEqualTo("Final delivery");
        assertThat(saved.getDescription()).isEqualTo("Release package");
        assertThat(saved.getAmount()).isEqualByComparingTo("300.00");
        assertThat(saved.getDueDate()).isEqualTo(request.dueDate());
        assertThat(saved.getStatus()).isEqualTo(MilestoneStatus.PENDING);

        assertThat(response.title()).isEqualTo("Final delivery");
        assertThat(response.amount()).isEqualByComparingTo("300.00");
        assertThat(response.status()).isEqualTo(MilestoneStatus.PENDING);
    }

    @Test
    void createMilestone_whenAmountEqualsStripeMinimum_isAllowed() {
        Contract contract = contract("contract-1", ContractStatus.ACTIVE, "500.00");
        when(contractService.findContractById("contract-1")).thenReturn(contract);
        when(milestoneRepository.findByContractId("contract-1")).thenReturn(List.of());

        milestoneService.createMilestone("contract-1", createRequest("Minimum", "Boundary", "5.00"), "client-1");

        ArgumentCaptor<Milestone> captor = ArgumentCaptor.forClass(Milestone.class);
        verify(milestoneRepository).save(captor.capture());
        assertThat(captor.getValue().getAmount()).isEqualByComparingTo("5.00");
    }

    @Test
    void createMilestone_whenCallerIsNotClient_throwsUnauthorized() {
        when(contractService.findContractById("contract-1"))
                .thenReturn(contract("contract-1", ContractStatus.ACTIVE, "500.00"));

        assertThatThrownBy(() -> milestoneService.createMilestone(
                "contract-1",
                createRequest("Final delivery", "Release package", "100.00"),
                "freelancer-1"
        ))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Only the client can perform this action");

        verifyNoInteractions(milestoneRepository);
    }

    @Test
    void createMilestone_whenContractIsNotActive_throwsIllegalState() {
        when(contractService.findContractById("contract-1"))
                .thenReturn(contract("contract-1", ContractStatus.CANCELLED, "500.00"));

        assertThatThrownBy(() -> milestoneService.createMilestone(
                "contract-1",
                createRequest("Final delivery", "Release package", "100.00"),
                "client-1"
        ))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Milestones can only be added to ACTIVE contracts");

        verifyNoInteractions(milestoneRepository);
    }

    @Test
    void createMilestone_whenAmountIsBelowStripeMinimum_throwsIllegalArgument() {
        when(contractService.findContractById("contract-1"))
                .thenReturn(contract("contract-1", ContractStatus.ACTIVE, "500.00"));

        assertThatThrownBy(() -> milestoneService.createMilestone(
                "contract-1",
                createRequest("Too small", "Boundary", "4.99"),
                "client-1"
        ))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Milestone amount must be at least $5.00.");

        verify(milestoneRepository, never()).save(any());
    }

    @Test
    void createMilestone_whenBudgetWouldBeExceeded_throwsIllegalStateWithRemainingBudget() {
        Contract contract = contract("contract-1", ContractStatus.ACTIVE, "500.00");
        when(contractService.findContractById("contract-1")).thenReturn(contract);
        when(milestoneRepository.findByContractId("contract-1")).thenReturn(List.of(
                milestone(contract, "ms-1", "450.00", MilestoneStatus.FUNDED)
        ));

        assertThatThrownBy(() -> milestoneService.createMilestone(
                "contract-1",
                createRequest("Over budget", "Too large", "50.01"),
                "client-1"
        ))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Cannot add milestone of $50.01 — only $50.00 remaining in the contract budget.");

        verify(milestoneRepository, never()).save(any());
    }

    @Test
    void getMilestones_whenCallerIsContractParty_returnsResponses() {
        Contract contract = contract("contract-1", ContractStatus.ACTIVE, "500.00");
        Milestone funded = milestone(contract, "ms-1", "100.00", MilestoneStatus.FUNDED);
        when(contractService.findContractById("contract-1")).thenReturn(contract);
        when(milestoneRepository.findByContractId("contract-1")).thenReturn(List.of(funded));

        List<MilestoneResponse> responses = milestoneService.getMilestones("contract-1", "freelancer-1");

        assertThat(responses).hasSize(1);
        assertThat(responses.getFirst().id()).isEqualTo("ms-1");
        assertThat(responses.getFirst().amount()).isEqualByComparingTo("100.00");
    }

    @Test
    void getMilestones_whenCallerIsNotParty_throwsUnauthorized() {
        when(contractService.findContractById("contract-1"))
                .thenReturn(contract("contract-1", ContractStatus.ACTIVE, "500.00"));

        assertThatThrownBy(() -> milestoneService.getMilestones("contract-1", "client-2"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("You are not a party to this contract");

        verify(milestoneRepository, never()).findByContractId(anyString());
    }

    @Test
    void submitDeliverable_whenFreelancerOwnsFundedMilestone_marksSubmittedAndNotifiesClient() {
        Milestone milestone = milestone(contract("contract-1", ContractStatus.ACTIVE, "500.00"),
                "ms-1", "100.00", MilestoneStatus.FUNDED);
        when(milestoneRepository.findById("ms-1")).thenReturn(Optional.of(milestone));

        MilestoneResponse response = milestoneService.submitDeliverable(
                "ms-1",
                new SubmitDeliverableRequest("https://deliverables.test/ms-1"),
                "freelancer-1"
        );

        assertThat(milestone.getStatus()).isEqualTo(MilestoneStatus.SUBMITTED);
        assertThat(milestone.getDeliverableUrl()).isEqualTo("https://deliverables.test/ms-1");
        assertThat(response.status()).isEqualTo(MilestoneStatus.SUBMITTED);
        verify(notificationService).notifyWithEmail(
                eq("client-1"),
                eq("client@example.com"),
                eq(NotificationType.MILESTONE_SUBMITTED),
                eq("Deliverable submitted for review"),
                eq("Freelancer User submitted \"Milestone ms-1\""),
                eq("ms-1"),
                eq(ReferenceType.MILESTONE),
                eq("Deliverable ready for review"),
                anyString()
        );
    }

    @Test
    void submitDeliverable_whenMilestoneNeedsRevision_allowsResubmission() {
        Milestone milestone = milestone(contract("contract-1", ContractStatus.ACTIVE, "500.00"),
                "ms-1", "100.00", MilestoneStatus.REVISION_REQUESTED);
        when(milestoneRepository.findById("ms-1")).thenReturn(Optional.of(milestone));

        milestoneService.submitDeliverable(
                "ms-1",
                new SubmitDeliverableRequest("https://deliverables.test/revision"),
                "freelancer-1"
        );

        assertThat(milestone.getStatus()).isEqualTo(MilestoneStatus.SUBMITTED);
        assertThat(milestone.getDeliverableUrl()).isEqualTo("https://deliverables.test/revision");
    }

    @Test
    void submitDeliverable_whenCallerIsNotFreelancer_throwsUnauthorized() {
        when(milestoneRepository.findById("ms-1")).thenReturn(Optional.of(
                milestone(contract("contract-1", ContractStatus.ACTIVE, "500.00"),
                        "ms-1", "100.00", MilestoneStatus.FUNDED)
        ));

        assertThatThrownBy(() -> milestoneService.submitDeliverable(
                "ms-1",
                new SubmitDeliverableRequest("https://deliverables.test/ms-1"),
                "freelancer-2"
        ))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Only the freelancer can perform this action");

        verifyNoInteractions(notificationService);
    }

    @Test
    void submitDeliverable_whenStatusCannotBeSubmitted_throwsIllegalState() {
        when(milestoneRepository.findById("ms-1")).thenReturn(Optional.of(
                milestone(contract("contract-1", ContractStatus.ACTIVE, "500.00"),
                        "ms-1", "100.00", MilestoneStatus.PENDING)
        ));

        assertThatThrownBy(() -> milestoneService.submitDeliverable(
                "ms-1",
                new SubmitDeliverableRequest("https://deliverables.test/ms-1"),
                "freelancer-1"
        ))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Deliverable can only be submitted when milestone is FUNDED or REVISION_REQUESTED. Current status: PENDING");

        verifyNoInteractions(notificationService);
    }

    @Test
    void approveMilestone_whenSubmittedAndNoUnresolvedMilestones_releasesPaymentAndAutoCompletesContract() {
        Contract contract = contract("contract-1", ContractStatus.ACTIVE, "100.00");
        Milestone milestone = milestone(contract, "ms-1", "100.00", MilestoneStatus.SUBMITTED);
        milestone.setFreelancerPayout(new BigDecimal("87.50"));
        when(milestoneRepository.findById("ms-1")).thenReturn(Optional.of(milestone));
        when(milestoneRepository.findByContractId("contract-1")).thenReturn(List.of(milestone));

        MilestoneResponse response = milestoneService.approveMilestone("ms-1", "client-1");

        assertThat(milestone.getStatus()).isEqualTo(MilestoneStatus.APPROVED);
        assertThat(response.status()).isEqualTo(MilestoneStatus.APPROVED);
        verify(paymentService).releasePayment(milestone);
        verify(contractService).completeContractInternal("contract-1", "client-1");
        verify(notificationService).notifyWithEmail(
                eq("freelancer-1"),
                eq("freelancer@example.com"),
                eq(NotificationType.MILESTONE_APPROVED),
                eq("Milestone approved — payment released 💰"),
                eq("\"Milestone ms-1\" approved. $87.50 transferred to your account."),
                eq("ms-1"),
                eq(ReferenceType.MILESTONE),
                eq("Milestone approved — payment released"),
                anyString()
        );
    }

    @Test
    void approveMilestone_whenAnotherMilestoneIsUnresolved_doesNotAutoCompleteContract() {
        Contract contract = contract("contract-1", ContractStatus.ACTIVE, "200.00");
        Milestone submitted = milestone(contract, "ms-1", "100.00", MilestoneStatus.SUBMITTED);
        Milestone funded = milestone(contract, "ms-2", "100.00", MilestoneStatus.FUNDED);
        when(milestoneRepository.findById("ms-1")).thenReturn(Optional.of(submitted));
        when(milestoneRepository.findByContractId("contract-1")).thenReturn(List.of(submitted, funded));

        milestoneService.approveMilestone("ms-1", "client-1");

        assertThat(submitted.getStatus()).isEqualTo(MilestoneStatus.APPROVED);
        verify(contractService, never()).completeContractInternal(anyString(), anyString());
    }

    @Test
    void approveMilestone_whenCallerIsNotClient_throwsUnauthorized() {
        when(milestoneRepository.findById("ms-1")).thenReturn(Optional.of(
                milestone(contract("contract-1", ContractStatus.ACTIVE, "500.00"),
                        "ms-1", "100.00", MilestoneStatus.SUBMITTED)
        ));

        assertThatThrownBy(() -> milestoneService.approveMilestone("ms-1", "client-2"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Only the client can perform this action");

        verifyNoInteractions(paymentService, notificationService);
    }

    @Test
    void approveMilestone_whenMilestoneIsNotSubmitted_throwsIllegalState() {
        when(milestoneRepository.findById("ms-1")).thenReturn(Optional.of(
                milestone(contract("contract-1", ContractStatus.ACTIVE, "500.00"),
                        "ms-1", "100.00", MilestoneStatus.FUNDED)
        ));

        assertThatThrownBy(() -> milestoneService.approveMilestone("ms-1", "client-1"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Only SUBMITTED milestones can be approved");

        verifyNoInteractions(paymentService, notificationService);
    }

    @Test
    void approveMilestone_whenPaymentReleaseFails_propagatesWithoutNotificationsOrAutoComplete() {
        Milestone milestone = milestone(contract("contract-1", ContractStatus.ACTIVE, "100.00"),
                "ms-1", "100.00", MilestoneStatus.SUBMITTED);
        when(milestoneRepository.findById("ms-1")).thenReturn(Optional.of(milestone));
        doThrow(new RuntimeException("Payout failed")).when(paymentService).releasePayment(milestone);

        assertThatThrownBy(() -> milestoneService.approveMilestone("ms-1", "client-1"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Payout failed");

        verifyNoInteractions(notificationService);
        verify(contractService, never()).completeContractInternal(anyString(), anyString());
    }

    @Test
    void milestoneRefundStateRoute_whenFundedAndNoSubmittedWork_refundsPayment() {
        Milestone milestone = milestone(contract("contract-1", ContractStatus.ACTIVE, "500.00"),
                "ms-1", "100.00", MilestoneStatus.FUNDED);
        when(milestoneRepository.findById("ms-1")).thenReturn(Optional.of(milestone));
        doAnswer(invocation -> {
            milestone.setStatus(MilestoneStatus.REFUNDED);
            return null;
        }).when(paymentService).refundPayment(milestone);

        MilestoneResponse response = milestoneService.refundMilestone("ms-1", "client-1");

        verify(paymentService).refundPayment(milestone);
        assertThat(response.status()).isEqualTo(MilestoneStatus.REFUNDED);
    }

    @Test
    void milestoneRefundStateRoute_whenCallerIsNotClient_throwsUnauthorized() {
        when(milestoneRepository.findById("ms-1")).thenReturn(Optional.of(
                milestone(contract("contract-1", ContractStatus.ACTIVE, "500.00"),
                        "ms-1", "100.00", MilestoneStatus.FUNDED)
        ));

        assertThatThrownBy(() -> milestoneService.refundMilestone("ms-1", "client-2"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Only the client can perform this action");

        verifyNoInteractions(paymentService);
    }

    @Test
    void milestoneRefundStateRoute_whenMilestoneIsNotFunded_throwsIllegalState() {
        when(milestoneRepository.findById("ms-1")).thenReturn(Optional.of(
                milestone(contract("contract-1", ContractStatus.ACTIVE, "500.00"),
                        "ms-1", "100.00", MilestoneStatus.SUBMITTED)
        ));

        assertThatThrownBy(() -> milestoneService.refundMilestone("ms-1", "client-1"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Only FUNDED milestones can be directly refunded. Use Dispute for submitted milestones.");

        verifyNoInteractions(paymentService);
    }

    @Test
    void milestoneRefundStateRoute_whenDeliverableAlreadySubmitted_throwsIllegalState() {
        Milestone milestone = milestone(contract("contract-1", ContractStatus.ACTIVE, "500.00"),
                "ms-1", "100.00", MilestoneStatus.FUNDED);
        milestone.setDeliverableUrl("https://deliverables.test/ms-1");
        when(milestoneRepository.findById("ms-1")).thenReturn(Optional.of(milestone));

        assertThatThrownBy(() -> milestoneService.refundMilestone("ms-1", "client-1"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Cannot refund milestone after work has been submitted.");

        verifyNoInteractions(paymentService);
    }

    @Test
    void requestRevision_whenSubmittedBelowMax_marksRevisionRequestedAndNotifiesFreelancer() {
        Milestone milestone = milestone(contract("contract-1", ContractStatus.ACTIVE, "500.00"),
                "ms-1", "100.00", MilestoneStatus.SUBMITTED);
        milestone.setRevisionCount(1);
        when(milestoneRepository.findById("ms-1")).thenReturn(Optional.of(milestone));

        MilestoneResponse response = milestoneService.requestRevision("ms-1", "client-1");

        assertThat(milestone.getStatus()).isEqualTo(MilestoneStatus.REVISION_REQUESTED);
        assertThat(milestone.getRevisionCount()).isEqualTo(2);
        assertThat(response.revisionCount()).isEqualTo(2);
        verify(notificationService).notify(
                "freelancer-1",
                NotificationType.MILESTONE_REVISION_REQUESTED,
                "Revision requested",
                "The client requested a revision on \"Milestone ms-1\".",
                "ms-1",
                ReferenceType.MILESTONE
        );
    }

    @Test
    void requestRevision_whenMaxRevisionReached_escalatesToDisputeAndNotifiesFreelancer() {
        Milestone milestone = milestone(contract("contract-1", ContractStatus.ACTIVE, "500.00"),
                "ms-1", "100.00", MilestoneStatus.SUBMITTED);
        milestone.setRevisionCount(2);
        when(milestoneRepository.findById("ms-1")).thenReturn(Optional.of(milestone));

        MilestoneResponse response = milestoneService.requestRevision("ms-1", "client-1");

        assertThat(milestone.getStatus()).isEqualTo(MilestoneStatus.DISPUTED);
        assertThat(milestone.getRevisionCount()).isEqualTo(3);
        assertThat(response.status()).isEqualTo(MilestoneStatus.DISPUTED);
        verify(notificationService).notify(
                "freelancer-1",
                NotificationType.MILESTONE_DISPUTED,
                "Milestone escalated to dispute",
                "Max revisions reached on \"Milestone ms-1\". Funds are frozen pending review.",
                "ms-1",
                ReferenceType.MILESTONE
        );
    }

    @Test
    void requestRevision_whenCallerIsNotClient_throwsUnauthorized() {
        when(milestoneRepository.findById("ms-1")).thenReturn(Optional.of(
                milestone(contract("contract-1", ContractStatus.ACTIVE, "500.00"),
                        "ms-1", "100.00", MilestoneStatus.SUBMITTED)
        ));

        assertThatThrownBy(() -> milestoneService.requestRevision("ms-1", "client-2"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Only the client can perform this action");

        verifyNoInteractions(notificationService);
    }

    @ParameterizedTest
    @EnumSource(value = MilestoneStatus.class, names = {"PENDING", "FUNDED", "APPROVED", "REVISION_REQUESTED", "DISPUTED", "REFUNDED"})
    void requestRevision_whenMilestoneIsNotSubmitted_throwsIllegalState(MilestoneStatus status) {
        when(milestoneRepository.findById("ms-1")).thenReturn(Optional.of(
                milestone(contract("contract-1", ContractStatus.ACTIVE, "500.00"),
                        "ms-1", "100.00", status)
        ));

        assertThatThrownBy(() -> milestoneService.requestRevision("ms-1", "client-1"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Revision can only be requested on SUBMITTED milestones");

        verifyNoInteractions(notificationService);
    }

    @Test
    void findMilestoneById_whenMilestoneDoesNotExist_throwsNotFound() {
        when(milestoneRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> milestoneService.findMilestoneById("missing"))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Milestone not found: missing");
    }

    private CreateMilestoneRequest createRequest(String title, String description, String amount) {
        return new CreateMilestoneRequest(
                title,
                description,
                new BigDecimal(amount),
                LocalDate.now().plusDays(30)
        );
    }

    private Contract contract(String id, ContractStatus status, String agreedPrice) {
        Client client = new Client();
        client.setId("client-1");
        client.setName("Client User");
        client.setEmail("client@example.com");

        Freelancer freelancer = new Freelancer();
        freelancer.setId("freelancer-1");
        freelancer.setName("Freelancer User");
        freelancer.setEmail("freelancer@example.com");

        Project project = new Project();
        project.setId("project-1");
        project.setTitle("Project One");
        project.setClient(client);

        Bid bid = new Bid();
        bid.setId("bid-1");
        bid.setProject(project);
        bid.setFreelancer(freelancer);
        bid.setProposedPrice(new BigDecimal(agreedPrice));
        bid.setEstimatedDays(30);

        Contract contract = new Contract();
        contract.setId(id);
        contract.setBid(bid);
        contract.setClient(client);
        contract.setFreelancer(freelancer);
        contract.setAgreedPrice(new BigDecimal(agreedPrice));
        contract.setStartDate(LocalDate.now().minusDays(5));
        contract.setEndDate(LocalDate.now().plusDays(25));
        contract.setStatus(status);
        return contract;
    }

    private Milestone milestone(Contract contract, String id, String amount, MilestoneStatus status) {
        Milestone milestone = new Milestone();
        milestone.setId(id);
        milestone.setContract(contract);
        milestone.setTitle("Milestone " + id);
        milestone.setDescription("Milestone description");
        milestone.setAmount(new BigDecimal(amount));
        milestone.setDueDate(LocalDate.now().plusDays(14));
        milestone.setStatus(status);
        milestone.setPlatformFeeAmount(new BigDecimal("12.50"));
        milestone.setFreelancerPayout(new BigDecimal("87.50"));
        return milestone;
    }

    private void setField(String name, Object value) {
        try {
            Field field = MilestoneService.class.getDeclaredField(name);
            field.setAccessible(true);
            field.set(milestoneService, value);
        } catch (ReflectiveOperationException e) {
            throw new AssertionError("Failed to set field " + name, e);
        }
    }
}
