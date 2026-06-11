package com.freelancehub.freelancehub.contract.service;

import com.freelancehub.freelancehub.bid.domain.Bid;
import com.freelancehub.freelancehub.contract.domain.Contract;
import com.freelancehub.freelancehub.contract.domain.ContractStatus;
import com.freelancehub.freelancehub.contract.domain.Milestone;
import com.freelancehub.freelancehub.contract.domain.MilestoneStatus;
import com.freelancehub.freelancehub.contract.dto.ContractResponse;
import com.freelancehub.freelancehub.contract.dto.ContractSummaryResponse;
import com.freelancehub.freelancehub.contract.repository.ContractRepository;
import com.freelancehub.freelancehub.contract.repository.MilestoneRepository;
import com.freelancehub.freelancehub.dispute.dto.OpenDisputeRequest;
import com.freelancehub.freelancehub.dispute.service.DisputeService;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

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
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ContractServiceTest {

    @Mock
    private ContractRepository contractRepository;

    @Mock
    private MilestoneRepository milestoneRepository;

    @Mock
    private PaymentService paymentService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private DisputeService disputeService;

    private ContractService contractService;

    @BeforeEach
    void setUp() {
        contractService = new ContractService(
                contractRepository,
                milestoneRepository,
                paymentService,
                notificationService,
                disputeService
        );
        setField("frontendUrl", "http://localhost:3000");
        lenient().when(contractRepository.findByIdForUpdate(anyString()))
                .thenAnswer(invocation -> contractRepository.findById(invocation.getArgument(0)));
    }

    @Test
    void createContract_whenBidHasPositiveDuration_createsActiveContractForBidParties() {
        Bid bid = bid("bid-1", "750.25", 14);

        ContractResponse response = contractService.createContract(bid);

        ArgumentCaptor<Contract> captor = ArgumentCaptor.forClass(Contract.class);
        verify(contractRepository).save(captor.capture());
        Contract saved = captor.getValue();
        assertThat(saved.getBid()).isSameAs(bid);
        assertThat(saved.getClient()).isSameAs(bid.getProject().getClient());
        assertThat(saved.getFreelancer()).isSameAs(bid.getFreelancer());
        assertThat(saved.getStatus()).isEqualTo(ContractStatus.ACTIVE);
        assertThat(saved.getAgreedPrice()).isEqualByComparingTo("750.25");
        assertThat(saved.getStartDate()).isEqualTo(LocalDate.now());
        assertThat(saved.getEndDate()).isEqualTo(LocalDate.now().plusDays(14));

        assertThat(response.status()).isEqualTo(ContractStatus.ACTIVE);
        assertThat(response.agreedPrice()).isEqualByComparingTo("750.25");
        assertThat(response.totalMilestones()).isZero();
    }

    @Test
    void createContract_whenBidDurationIsZero_throwsIllegalState() {
        Bid bid = bid("bid-1", "750.25", 0);

        assertThatThrownBy(() -> contractService.createContract(bid))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Invalid bid duration");

        verify(contractRepository, never()).save(any());
    }

    @Test
    void getContract_whenCallerIsParty_returnsContractWithMilestoneStats() {
        Contract contract = contract("contract-1", ContractStatus.ACTIVE);
        Milestone approved = milestone(contract, "ms-1", "100.00", MilestoneStatus.APPROVED);
        approved.setFreelancerPayout(new BigDecimal("87.50"));
        Milestone submitted = milestone(contract, "ms-2", "50.00", MilestoneStatus.SUBMITTED);
        when(contractRepository.findById("contract-1")).thenReturn(Optional.of(contract));
        when(milestoneRepository.findByContractId("contract-1")).thenReturn(List.of(approved, submitted));

        ContractResponse response = contractService.getContract("contract-1", "freelancer-1");

        assertThat(response.id()).isEqualTo("contract-1");
        assertThat(response.totalMilestones()).isEqualTo(2);
        assertThat(response.approvedMilestones()).isEqualTo(1);
        assertThat(response.pendingReviewCount()).isEqualTo(1);
        assertThat(response.totalAllocated()).isEqualByComparingTo("150.00");
        assertThat(response.clientTotalReleased()).isEqualByComparingTo("100.00");
        assertThat(response.freelancerTotalEarned()).isEqualByComparingTo("87.50");
    }

    @Test
    void getContract_whenCallerIsNotParty_throwsUnauthorized() {
        when(contractRepository.findById("contract-1")).thenReturn(Optional.of(contract("contract-1", ContractStatus.ACTIVE)));

        assertThatThrownBy(() -> contractService.getContract("contract-1", "client-2"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("You are not a party to this contract");

        verifyNoInteractions(milestoneRepository);
    }

    @Test
    void getContract_whenContractDoesNotExist_throwsNotFound() {
        when(contractRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> contractService.getContract("missing", "client-1"))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Contract not found: missing");
    }

    @Test
    void completeContractInternal_whenClientOwnsActiveContractAndMilestonesResolved_marksCompleted() {
        Contract contract = contract("contract-1", ContractStatus.ACTIVE);
        when(contractRepository.findById("contract-1")).thenReturn(Optional.of(contract));
        when(milestoneRepository.findByContractId("contract-1")).thenReturn(List.of(
                milestone(contract, "ms-1", "100.00", MilestoneStatus.APPROVED),
                milestone(contract, "ms-2", "25.00", MilestoneStatus.REFUNDED)
        ));

        ContractResponse response = contractService.completeContractInternal("contract-1", "client-1");

        assertThat(contract.getStatus()).isEqualTo(ContractStatus.COMPLETED);
        assertThat(contract.getEndDate()).isEqualTo(LocalDate.now());
        assertThat(response.status()).isEqualTo(ContractStatus.COMPLETED);
        assertThat(response.totalMilestones()).isEqualTo(2);
        assertThat(response.clientTotalReleased()).isEqualByComparingTo("100.00");
    }

    @Test
    void completeContractInternal_whenCallerIsNotClient_throwsUnauthorized() {
        when(contractRepository.findById("contract-1")).thenReturn(Optional.of(contract("contract-1", ContractStatus.ACTIVE)));

        assertThatThrownBy(() -> contractService.completeContractInternal("contract-1", "freelancer-1"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Only the client can perform this action");

        verifyNoInteractions(milestoneRepository);
    }

    @Test
    void completeContractInternal_whenContractIsNotActive_throwsIllegalState() {
        when(contractRepository.findById("contract-1")).thenReturn(Optional.of(contract("contract-1", ContractStatus.CANCELLED)));

        assertThatThrownBy(() -> contractService.completeContractInternal("contract-1", "client-1"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Only ACTIVE contracts can be completed");

        verifyNoInteractions(milestoneRepository);
    }

    @ParameterizedTest
    @EnumSource(value = MilestoneStatus.class, names = {"PENDING", "FUNDED", "SUBMITTED", "REVISION_REQUESTED"})
    void completeContractInternal_whenMilestoneIsUnresolved_throwsIllegalState(MilestoneStatus unresolvedStatus) {
        Contract contract = contract("contract-1", ContractStatus.ACTIVE);
        when(contractRepository.findById("contract-1")).thenReturn(Optional.of(contract));
        when(milestoneRepository.findByContractId("contract-1"))
                .thenReturn(List.of(milestone(contract, "ms-1", "100.00", unresolvedStatus)));

        assertThatThrownBy(() -> contractService.completeContractInternal("contract-1", "client-1"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Cannot complete contract. You have active or funded milestones. Please approve, refund, or dispute them first.");

        assertThat(contract.getStatus()).isEqualTo(ContractStatus.ACTIVE);
    }

    @Test
    void cancelContract_whenPartyCancelsActiveContractWithoutLockedFunds_refundsAndNotifiesBothParties() {
        Contract contract = contract("contract-1", ContractStatus.ACTIVE);
        when(contractRepository.findById("contract-1")).thenReturn(Optional.of(contract));
        when(milestoneRepository.findByContractId("contract-1")).thenReturn(List.of(
                milestone(contract, "ms-1", "100.00", MilestoneStatus.FUNDED),
                milestone(contract, "ms-2", "25.00", MilestoneStatus.PENDING)
        ));

        ContractResponse response = contractService.cancelContract("contract-1", "freelancer-1");

        assertThat(contract.getStatus()).isEqualTo(ContractStatus.CANCELLED);
        assertThat(contract.getEndDate()).isEqualTo(LocalDate.now());
        assertThat(response.status()).isEqualTo(ContractStatus.CANCELLED);
        verify(paymentService).refundAllFundedMilestones("contract-1");
        verify(notificationService).notifyWithEmail(
                eq("client-1"),
                eq("client@example.com"),
                eq(NotificationType.CONTRACT_CANCELLED),
                eq("Contract cancelled"),
                eq("The contract for \"Project One\" has been cancelled."),
                eq("contract-1"),
                eq(ReferenceType.CONTRACT),
                eq("Contract cancelled"),
                anyString()
        );
        verify(notificationService).notifyWithEmail(
                eq("freelancer-1"),
                eq("freelancer@example.com"),
                eq(NotificationType.CONTRACT_CANCELLED),
                eq("Contract cancelled"),
                eq("The contract for \"Project One\" has been cancelled."),
                eq("contract-1"),
                eq(ReferenceType.CONTRACT),
                eq("Contract cancelled"),
                anyString()
        );
    }

    @Test
    void cancelContract_whenCallerIsNotParty_throwsUnauthorized() {
        when(contractRepository.findById("contract-1")).thenReturn(Optional.of(contract("contract-1", ContractStatus.ACTIVE)));

        assertThatThrownBy(() -> contractService.cancelContract("contract-1", "client-2"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("You are not a party to this contract");

        verifyNoInteractions(milestoneRepository, paymentService, notificationService);
    }

    @Test
    void cancelContract_whenContractIsNotActive_throwsIllegalState() {
        when(contractRepository.findById("contract-1")).thenReturn(Optional.of(contract("contract-1", ContractStatus.COMPLETED)));

        assertThatThrownBy(() -> contractService.cancelContract("contract-1", "client-1"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Only ACTIVE contracts can be cancelled");

        verifyNoInteractions(milestoneRepository, paymentService, notificationService);
    }

    @ParameterizedTest
    @EnumSource(value = MilestoneStatus.class, names = {"SUBMITTED", "REVISION_REQUESTED", "DISPUTED"})
    void cancelContract_whenMilestoneHasLockedFunds_throwsIllegalStateWithoutRefunding(MilestoneStatus lockedStatus) {
        Contract contract = contract("contract-1", ContractStatus.ACTIVE);
        when(contractRepository.findById("contract-1")).thenReturn(Optional.of(contract));
        when(milestoneRepository.findByContractId("contract-1"))
                .thenReturn(List.of(milestone(contract, "ms-1", "100.00", lockedStatus)));

        assertThatThrownBy(() -> contractService.cancelContract("contract-1", "client-1"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Cannot cancel contract. Work has been submitted or is in dispute. Please approve or open a formal dispute.");

        assertThat(contract.getStatus()).isEqualTo(ContractStatus.ACTIVE);
        verifyNoInteractions(paymentService, notificationService);
    }

    @Test
    void disputeContract_whenPartyDisputesActiveContract_marksDisputedCreatesDisputeAndNotifiesBothParties() {
        Contract contract = contract("contract-1", ContractStatus.ACTIVE);
        when(contractRepository.findById("contract-1")).thenReturn(Optional.of(contract));
        when(milestoneRepository.findByContractId("contract-1")).thenReturn(List.of());

        ContractResponse response = contractService.disputeContract(
                "contract-1",
                "freelancer-1",
                new OpenDisputeRequest("scope disagreement")
        );

        assertThat(contract.getStatus()).isEqualTo(ContractStatus.DISPUTED);
        assertThat(response.status()).isEqualTo(ContractStatus.DISPUTED);
        verify(disputeService).createDispute("contract-1", "freelancer-1", "scope disagreement");
        verify(notificationService).notifyWithEmail(
                eq("client-1"),
                eq("client@example.com"),
                eq(NotificationType.CONTRACT_DISPUTED),
                eq("Contract disputed"),
                eq("The contract for \"Project One\" is now under dispute."),
                eq("contract-1"),
                eq(ReferenceType.CONTRACT),
                eq("Contract disputed"),
                anyString()
        );
        verify(notificationService).notifyWithEmail(
                eq("freelancer-1"),
                eq("freelancer@example.com"),
                eq(NotificationType.CONTRACT_DISPUTED),
                eq("Contract disputed"),
                eq("The contract for \"Project One\" is now under dispute."),
                eq("contract-1"),
                eq(ReferenceType.CONTRACT),
                eq("Contract disputed"),
                anyString()
        );
    }

    @Test
    void disputeContract_whenCallerIsNotParty_throwsUnauthorized() {
        when(contractRepository.findById("contract-1")).thenReturn(Optional.of(contract("contract-1", ContractStatus.ACTIVE)));

        assertThatThrownBy(() -> contractService.disputeContract(
                "contract-1",
                "client-2",
                new OpenDisputeRequest("scope disagreement")
        ))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("You are not a party to this contract");

        verifyNoInteractions(disputeService, notificationService);
    }

    @Test
    void disputeContract_whenContractIsNotActive_throwsIllegalState() {
        when(contractRepository.findById("contract-1")).thenReturn(Optional.of(contract("contract-1", ContractStatus.CANCELLED)));

        assertThatThrownBy(() -> contractService.disputeContract(
                "contract-1",
                "client-1",
                new OpenDisputeRequest("scope disagreement")
        ))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Only ACTIVE contracts can be disputed");

        verifyNoInteractions(disputeService, notificationService);
    }

    @Test
    void getMyContracts_whenStatusProvided_usesStatusFilterAndMapsMilestoneStats() {
        Contract contract = contract("contract-1", ContractStatus.ACTIVE);
        when(contractRepository.findAllByUserIdAndStatus("client-1", ContractStatus.ACTIVE, PageRequest.of(0, 10)))
                .thenReturn(new PageImpl<>(List.of(contract)));
        when(milestoneRepository.findByContractIdIn(List.of("contract-1")))
                .thenReturn(List.of(milestone(contract, "ms-1", "100.00", MilestoneStatus.SUBMITTED)));

        Page<ContractResponse> response = contractService.getMyContracts("client-1", ContractStatus.ACTIVE, PageRequest.of(0, 10));

        assertThat(response.getTotalElements()).isEqualTo(1);
        assertThat(response.getContent().getFirst().pendingReviewCount()).isEqualTo(1);
        verify(contractRepository).findAllByUserIdAndStatus("client-1", ContractStatus.ACTIVE, PageRequest.of(0, 10));
    }

    @Test
    void getMyContractsSummary_countsStatusesAndAggregatesReleasedAmounts() {
        Contract active = contract("active", ContractStatus.ACTIVE, "100.00");
        Contract completed = contract("completed", ContractStatus.COMPLETED, "200.00");
        Contract disputed = contract("disputed", ContractStatus.DISPUTED, "300.00");
        Contract cancelled = contract("cancelled", ContractStatus.CANCELLED, "400.00");
        Milestone approved = milestone(completed, "ms-1", "80.00", MilestoneStatus.APPROVED);
        approved.setFreelancerPayout(new BigDecimal("70.00"));
        when(contractRepository.findAllByUserId("client-1"))
                .thenReturn(List.of(active, completed, disputed, cancelled));
        when(milestoneRepository.findByContractIdIn(List.of("active", "completed", "disputed", "cancelled")))
                .thenReturn(List.of(approved));

        ContractSummaryResponse summary = contractService.getMyContractsSummary("client-1");

        assertThat(summary.totalContracts()).isEqualTo(4);
        assertThat(summary.activeCount()).isEqualTo(1);
        assertThat(summary.completedCount()).isEqualTo(1);
        assertThat(summary.disputedCount()).isEqualTo(1);
        assertThat(summary.cancelledCount()).isEqualTo(1);
        assertThat(summary.activeValue()).isEqualByComparingTo("100.00");
        assertThat(summary.clientTotalReleased()).isEqualByComparingTo("80.00");
        assertThat(summary.freelancerTotalEarned()).isEqualByComparingTo("70.00");
    }

    private Contract contract(String id, ContractStatus status) {
        return contract(id, status, "1000.00");
    }

    private Contract contract(String id, ContractStatus status, String agreedPrice) {
        Bid bid = bid("bid-1", agreedPrice, 30);
        Contract contract = new Contract();
        contract.setId(id);
        contract.setBid(bid);
        contract.setClient(bid.getProject().getClient());
        contract.setFreelancer(bid.getFreelancer());
        contract.setAgreedPrice(new BigDecimal(agreedPrice));
        contract.setStartDate(LocalDate.now().minusDays(10));
        contract.setEndDate(LocalDate.now().plusDays(20));
        contract.setStatus(status);
        return contract;
    }

    private Bid bid(String id, String price, int estimatedDays) {
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
        bid.setId(id);
        bid.setProject(project);
        bid.setFreelancer(freelancer);
        bid.setProposedPrice(new BigDecimal(price));
        bid.setEstimatedDays(estimatedDays);
        return bid;
    }

    private Milestone milestone(Contract contract, String id, String amount, MilestoneStatus status) {
        Milestone milestone = new Milestone();
        milestone.setId(id);
        milestone.setContract(contract);
        milestone.setTitle("Milestone " + id);
        milestone.setAmount(new BigDecimal(amount));
        milestone.setFreelancerPayout(BigDecimal.ZERO);
        milestone.setStatus(status);
        return milestone;
    }

    private void setField(String name, Object value) {
        try {
            Field field = ContractService.class.getDeclaredField(name);
            field.setAccessible(true);
            field.set(contractService, value);
        } catch (ReflectiveOperationException e) {
            throw new AssertionError("Failed to set field " + name, e);
        }
    }
}
