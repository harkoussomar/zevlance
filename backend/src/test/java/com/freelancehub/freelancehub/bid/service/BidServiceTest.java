package com.freelancehub.freelancehub.bid.service;

import com.freelancehub.freelancehub.bid.domain.Bid;
import com.freelancehub.freelancehub.bid.domain.BidStatus;
import com.freelancehub.freelancehub.bid.dto.BidResponse;
import com.freelancehub.freelancehub.bid.dto.BidSummaryResponse;
import com.freelancehub.freelancehub.bid.dto.CreateBidRequest;
import com.freelancehub.freelancehub.bid.repository.BidRepository;
import com.freelancehub.freelancehub.contract.domain.ContractStatus;
import com.freelancehub.freelancehub.contract.dto.ContractResponse;
import com.freelancehub.freelancehub.contract.service.ContractService;
import com.freelancehub.freelancehub.exception.ConflictException;
import com.freelancehub.freelancehub.exception.NotFoundException;
import com.freelancehub.freelancehub.exception.UnauthorizedException;
import com.freelancehub.freelancehub.notification.domain.NotificationType;
import com.freelancehub.freelancehub.notification.domain.ReferenceType;
import com.freelancehub.freelancehub.notification.service.NotificationService;
import com.freelancehub.freelancehub.project.domain.Project;
import com.freelancehub.freelancehub.project.domain.ProjectStatus;
import com.freelancehub.freelancehub.project.service.ProjectService;
import com.freelancehub.freelancehub.user.domain.Client;
import com.freelancehub.freelancehub.user.domain.Freelancer;
import com.freelancehub.freelancehub.user.service.UserService;
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
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BidServiceTest {

    @Mock
    private BidRepository bidRepository;

    @Mock
    private ContractService contractService;

    @Mock
    private ProjectService projectService;

    @Mock
    private UserService userService;

    @Mock
    private NotificationService notificationService;

    private BidService bidService;

    @BeforeEach
    void setUp() {
        bidService = new BidService(
                bidRepository,
                contractService,
                projectService,
                userService,
                notificationService
        );
        setField("frontendUrl", "http://localhost:3000");
    }

    @Test
    void submitBid_whenProjectOpenAndNoDuplicate_savesPendingBidAndNotifiesClient() {
        Project project = project("project-1", ProjectStatus.OPEN);
        Freelancer freelancer = freelancer("freelancer-1");
        when(projectService.findProjectById("project-1")).thenReturn(project);
        when(bidRepository.existsByFreelancerIdAndProjectId("freelancer-1", "project-1")).thenReturn(false);
        when(userService.findFreelancerById("freelancer-1")).thenReturn(freelancer);
        doAnswer(invocation -> {
            Bid bid = invocation.getArgument(0);
            bid.setId("bid-1");
            return bid;
        }).when(bidRepository).save(any(Bid.class));

        BidResponse response = bidService.submitBid("project-1", createBidRequest("500.25", 14), "freelancer-1");

        ArgumentCaptor<Bid> captor = ArgumentCaptor.forClass(Bid.class);
        verify(bidRepository).save(captor.capture());
        Bid saved = captor.getValue();
        assertThat(saved.getProject()).isSameAs(project);
        assertThat(saved.getFreelancer()).isSameAs(freelancer);
        assertThat(saved.getStatus()).isEqualTo(BidStatus.PENDING);
        assertThat(saved.getProposedPrice()).isEqualByComparingTo("500.25");
        assertThat(saved.getEstimatedDays()).isEqualTo(14);
        assertThat(response.id()).isEqualTo("bid-1");
        assertThat(response.status()).isEqualTo(BidStatus.PENDING);
        assertThat(response.proposedPrice()).isEqualByComparingTo("500.25");
        verify(notificationService).notifyWithEmail(
                eq("client-1"),
                eq("client@example.com"),
                eq(NotificationType.BID_RECEIVED),
                eq("New bid on \"Project One\""),
                eq("Freelancer User submitted a bid of $500.25"),
                eq("bid-1"),
                eq(ReferenceType.BID),
                eq("New bid on your project"),
                anyString()
        );
    }

    @Test
    void submitBid_whenProjectIsNotOpen_throwsIllegalState() {
        when(projectService.findProjectById("project-1")).thenReturn(project("project-1", ProjectStatus.IN_PROGRESS));

        assertThatThrownBy(() -> bidService.submitBid("project-1", createBidRequest("500.00", 14), "freelancer-1"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Project is not open for bidding");

        verifyNoInteractions(userService, notificationService);
        verify(bidRepository, never()).save(any());
    }

    @Test
    void submitBid_whenFreelancerAlreadyBidOnProject_throwsConflict() {
        when(projectService.findProjectById("project-1")).thenReturn(project("project-1", ProjectStatus.OPEN));
        when(bidRepository.existsByFreelancerIdAndProjectId("freelancer-1", "project-1")).thenReturn(true);

        assertThatThrownBy(() -> bidService.submitBid("project-1", createBidRequest("500.00", 14), "freelancer-1"))
                .isInstanceOf(ConflictException.class)
                .hasMessage("You have already submitted a bid on this project");

        verifyNoInteractions(userService, notificationService);
        verify(bidRepository, never()).save(any());
    }

    @Test
    void getProjectBids_whenClientOwnsProject_returnsBidPage() {
        Project project = project("project-1", ProjectStatus.OPEN);
        Bid bid = bid("bid-1", project, freelancer("freelancer-1"), BidStatus.PENDING);
        when(projectService.findProjectById("project-1")).thenReturn(project);
        when(bidRepository.findByProjectId("project-1", PageRequest.of(0, 10)))
                .thenReturn(new PageImpl<>(List.of(bid)));

        Page<BidResponse> response = bidService.getProjectBids("project-1", "client-1", PageRequest.of(0, 10));

        assertThat(response.getTotalElements()).isEqualTo(1);
        assertThat(response.getContent().getFirst().id()).isEqualTo("bid-1");
        assertThat(response.getContent().getFirst().proposedPrice()).isEqualByComparingTo("500.00");
    }

    @Test
    void getProjectBids_whenClientDoesNotOwnProject_throwsUnauthorized() {
        when(projectService.findProjectById("project-1")).thenReturn(project("project-1", ProjectStatus.OPEN));

        assertThatThrownBy(() -> bidService.getProjectBids("project-1", "client-2", PageRequest.of(0, 10)))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("You do not own this project");

        verify(bidRepository, never()).findByProjectId(anyString(), any());
    }

    @Test
    void withdrawBid_whenFreelancerOwnsPendingBid_marksWithdrawnAndNotifiesClient() {
        Bid bid = bid("bid-1", project("project-1", ProjectStatus.OPEN), freelancer("freelancer-1"), BidStatus.PENDING);
        when(bidRepository.findById("bid-1")).thenReturn(Optional.of(bid));

        BidResponse response = bidService.withdrawBid("bid-1", "freelancer-1");

        assertThat(bid.getStatus()).isEqualTo(BidStatus.WITHDRAWN);
        assertThat(response.status()).isEqualTo(BidStatus.WITHDRAWN);
        verify(notificationService).notify(
                "client-1",
                NotificationType.BID_WITHDRAWN,
                "A freelancer withdrew their bid",
                "Freelancer User withdrew their bid on \"Project One\"",
                "bid-1",
                ReferenceType.BID
        );
    }

    @Test
    void withdrawBid_whenCallerDoesNotOwnBid_throwsUnauthorized() {
        when(bidRepository.findById("bid-1")).thenReturn(Optional.of(
                bid("bid-1", project("project-1", ProjectStatus.OPEN), freelancer("freelancer-1"), BidStatus.PENDING)
        ));

        assertThatThrownBy(() -> bidService.withdrawBid("bid-1", "freelancer-2"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("You do not own this bid");

        verifyNoInteractions(notificationService);
    }

    @ParameterizedTest
    @EnumSource(value = BidStatus.class, names = {"ACCEPTED", "REJECTED", "WITHDRAWN"})
    void withdrawBid_whenBidIsNotPending_throwsIllegalState(BidStatus status) {
        when(bidRepository.findById("bid-1")).thenReturn(Optional.of(
                bid("bid-1", project("project-1", ProjectStatus.OPEN), freelancer("freelancer-1"), status)
        ));

        assertThatThrownBy(() -> bidService.withdrawBid("bid-1", "freelancer-1"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Only PENDING bids can be withdrawn");

        verifyNoInteractions(notificationService);
    }

    @Test
    void rejectBid_whenClientOwnsProjectAndBidPending_marksRejectedAndNotifiesFreelancer() {
        Bid bid = bid("bid-1", project("project-1", ProjectStatus.OPEN), freelancer("freelancer-1"), BidStatus.PENDING);
        when(bidRepository.findById("bid-1")).thenReturn(Optional.of(bid));

        BidResponse response = bidService.rejectBid("bid-1", "client-1");

        assertThat(bid.getStatus()).isEqualTo(BidStatus.REJECTED);
        assertThat(response.status()).isEqualTo(BidStatus.REJECTED);
        verify(notificationService).notifyWithEmail(
                eq("freelancer-1"),
                eq("freelancer@example.com"),
                eq(NotificationType.BID_REJECTED),
                eq("Your bid was not selected"),
                eq("Your bid on \"Project One\" was rejected."),
                eq("bid-1"),
                eq(ReferenceType.BID),
                eq("Bid update"),
                anyString()
        );
    }

    @Test
    void rejectBid_whenClientDoesNotOwnProject_throwsUnauthorized() {
        when(bidRepository.findById("bid-1")).thenReturn(Optional.of(
                bid("bid-1", project("project-1", ProjectStatus.OPEN), freelancer("freelancer-1"), BidStatus.PENDING)
        ));

        assertThatThrownBy(() -> bidService.rejectBid("bid-1", "client-2"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("You do not own this project");

        verifyNoInteractions(notificationService);
    }

    @ParameterizedTest
    @EnumSource(value = BidStatus.class, names = {"ACCEPTED", "REJECTED", "WITHDRAWN"})
    void rejectBid_whenBidIsNotPending_throwsIllegalState(BidStatus status) {
        when(bidRepository.findById("bid-1")).thenReturn(Optional.of(
                bid("bid-1", project("project-1", ProjectStatus.OPEN), freelancer("freelancer-1"), status)
        ));

        assertThatThrownBy(() -> bidService.rejectBid("bid-1", "client-1"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Only PENDING bids can be rejected");

        verifyNoInteractions(notificationService);
    }

    @Test
    void acceptBid_whenClientOwnsPendingBidOnOpenProject_createsContractAndNotifiesFreelancer() {
        Project project = project("project-1", ProjectStatus.OPEN);
        Bid bid = bid("bid-1", project, freelancer("freelancer-1"), BidStatus.PENDING);
        ContractResponse contractResponse = contractResponse("contract-1");
        when(bidRepository.findById("bid-1")).thenReturn(Optional.of(bid));
        when(contractService.createContract(bid)).thenReturn(contractResponse);

        ContractResponse response = bidService.acceptBid("bid-1", "client-1");

        assertThat(response).isSameAs(contractResponse);
        assertThat(bid.getStatus()).isEqualTo(BidStatus.ACCEPTED);
        assertThat(project.getStatus()).isEqualTo(ProjectStatus.IN_PROGRESS);
        verify(bidRepository).rejectOtherBids("project-1", "bid-1", BidStatus.REJECTED);
        verify(contractService).createContract(bid);
        verify(notificationService).notifyWithEmail(
                eq("freelancer-1"),
                eq("freelancer@example.com"),
                eq(NotificationType.BID_ACCEPTED),
                eq("Your bid was accepted! 🎉"),
                eq("Your bid on \"Project One\" was accepted. Contract is now active."),
                eq("bid-1"),
                eq(ReferenceType.BID),
                eq("Your bid was accepted!"),
                anyString()
        );
    }

    @Test
    void acceptBid_whenClientDoesNotOwnProject_throwsUnauthorized() {
        when(bidRepository.findById("bid-1")).thenReturn(Optional.of(
                bid("bid-1", project("project-1", ProjectStatus.OPEN), freelancer("freelancer-1"), BidStatus.PENDING)
        ));

        assertThatThrownBy(() -> bidService.acceptBid("bid-1", "client-2"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("You do not own this project");

        verifyNoInteractions(contractService, notificationService);
    }

    @ParameterizedTest
    @EnumSource(value = BidStatus.class, names = {"ACCEPTED", "REJECTED", "WITHDRAWN"})
    void acceptBid_whenBidIsNotPending_throwsIllegalState(BidStatus status) {
        when(bidRepository.findById("bid-1")).thenReturn(Optional.of(
                bid("bid-1", project("project-1", ProjectStatus.OPEN), freelancer("freelancer-1"), status)
        ));

        assertThatThrownBy(() -> bidService.acceptBid("bid-1", "client-1"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Only PENDING bids can be accepted");

        verifyNoInteractions(contractService, notificationService);
    }

    @Test
    void acceptBid_whenProjectIsNoLongerOpen_throwsIllegalState() {
        Project project = project("project-1", ProjectStatus.IN_PROGRESS);
        when(bidRepository.findById("bid-1")).thenReturn(Optional.of(
                bid("bid-1", project, freelancer("freelancer-1"), BidStatus.PENDING)
        ));

        assertThatThrownBy(() -> bidService.acceptBid("bid-1", "client-1"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Project is no longer open");

        verifyNoInteractions(contractService, notificationService);
        verify(bidRepository, never()).rejectOtherBids(anyString(), anyString(), any());
    }

    @Test
    void acceptBid_whenContractCreationFails_propagatesWithoutNotification() {
        Project project = project("project-1", ProjectStatus.OPEN);
        Bid bid = bid("bid-1", project, freelancer("freelancer-1"), BidStatus.PENDING);
        when(bidRepository.findById("bid-1")).thenReturn(Optional.of(bid));
        when(contractService.createContract(bid)).thenThrow(new IllegalStateException("Invalid bid duration"));

        assertThatThrownBy(() -> bidService.acceptBid("bid-1", "client-1"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Invalid bid duration");

        verifyNoInteractions(notificationService);
    }

    @Test
    void getMyBids_whenStatusIsNull_usesUnfilteredFreelancerQuery() {
        Bid bid = bid("bid-1", project("project-1", ProjectStatus.OPEN), freelancer("freelancer-1"), BidStatus.PENDING);
        when(bidRepository.findByFreelancerId("freelancer-1", PageRequest.of(0, 10)))
                .thenReturn(new PageImpl<>(List.of(bid)));

        Page<BidResponse> response = bidService.getMyBids("freelancer-1", null, PageRequest.of(0, 10));

        assertThat(response.getTotalElements()).isEqualTo(1);
        verify(bidRepository).findByFreelancerId("freelancer-1", PageRequest.of(0, 10));
        verify(bidRepository, never()).findByFreelancerIdAndStatus(anyString(), any(), any());
    }

    @Test
    void getMyBids_whenStatusProvided_usesStatusFilteredQuery() {
        Bid bid = bid("bid-1", project("project-1", ProjectStatus.OPEN), freelancer("freelancer-1"), BidStatus.REJECTED);
        when(bidRepository.findByFreelancerIdAndStatus("freelancer-1", BidStatus.REJECTED, PageRequest.of(0, 10)))
                .thenReturn(new PageImpl<>(List.of(bid)));

        Page<BidResponse> response = bidService.getMyBids("freelancer-1", BidStatus.REJECTED, PageRequest.of(0, 10));

        assertThat(response.getContent().getFirst().status()).isEqualTo(BidStatus.REJECTED);
        verify(bidRepository).findByFreelancerIdAndStatus("freelancer-1", BidStatus.REJECTED, PageRequest.of(0, 10));
        verify(bidRepository, never()).findByFreelancerId(anyString(), any());
    }

    @Test
    void getMyBidsSummary_whenBidsExist_calculatesTotalsAndRoundedSuccessRate() {
        when(bidRepository.countByFreelancerIdAndStatus("freelancer-1", BidStatus.PENDING)).thenReturn(1L);
        when(bidRepository.countByFreelancerIdAndStatus("freelancer-1", BidStatus.ACCEPTED)).thenReturn(2L);
        when(bidRepository.countByFreelancerIdAndStatus("freelancer-1", BidStatus.REJECTED)).thenReturn(2L);
        when(bidRepository.countByFreelancerIdAndStatus("freelancer-1", BidStatus.WITHDRAWN)).thenReturn(1L);
        when(bidRepository.sumAcceptedValueByFreelancerId("freelancer-1")).thenReturn(1200.50);

        BidSummaryResponse summary = bidService.getMyBidsSummary("freelancer-1");

        assertThat(summary.pending()).isEqualTo(1);
        assertThat(summary.accepted()).isEqualTo(2);
        assertThat(summary.rejected()).isEqualTo(2);
        assertThat(summary.withdrawn()).isEqualTo(1);
        assertThat(summary.totalValue()).isEqualTo(1200.50);
        assertThat(summary.successRate()).isEqualTo(33.3);
    }

    @Test
    void getMyBidsSummary_whenNoBidsExist_returnsZeroSuccessRate() {
        when(bidRepository.sumAcceptedValueByFreelancerId("freelancer-1")).thenReturn(0.0);

        BidSummaryResponse summary = bidService.getMyBidsSummary("freelancer-1");

        assertThat(summary.pending()).isZero();
        assertThat(summary.accepted()).isZero();
        assertThat(summary.successRate()).isZero();
        assertThat(summary.totalValue()).isZero();
    }

    @Test
    void withdrawBid_whenBidDoesNotExist_throwsNotFound() {
        when(bidRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bidService.withdrawBid("missing", "freelancer-1"))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Bid not found: missing");
    }

    private CreateBidRequest createBidRequest(String price, int estimatedDays) {
        return new CreateBidRequest(
                new BigDecimal(price),
                "This cover letter is intentionally long enough to satisfy validation.",
                estimatedDays
        );
    }

    private Project project(String id, ProjectStatus status) {
        Client client = new Client();
        client.setId("client-1");
        client.setName("Client User");
        client.setEmail("client@example.com");

        Project project = new Project();
        project.setId(id);
        project.setTitle("Project One");
        project.setDescription("Project description");
        project.setClient(client);
        project.setStatus(status);
        project.setBudgetMin(new BigDecimal("100.00"));
        project.setBudgetMax(new BigDecimal("1000.00"));
        project.setDeadline(LocalDate.now().plusDays(30));
        return project;
    }

    private Freelancer freelancer(String id) {
        Freelancer freelancer = new Freelancer();
        freelancer.setId(id);
        freelancer.setName("Freelancer User");
        freelancer.setEmail(id + "@example.com");
        if ("freelancer-1".equals(id)) {
            freelancer.setEmail("freelancer@example.com");
        }
        return freelancer;
    }

    private Bid bid(String id, Project project, Freelancer freelancer, BidStatus status) {
        Bid bid = new Bid();
        bid.setId(id);
        bid.setProject(project);
        bid.setFreelancer(freelancer);
        bid.setProposedPrice(new BigDecimal("500.00"));
        bid.setCoverLetter("This cover letter is intentionally long enough to satisfy validation.");
        bid.setEstimatedDays(14);
        bid.setStatus(status);
        return bid;
    }

    private ContractResponse contractResponse(String id) {
        return new ContractResponse(
                id,
                "bid-1",
                "project-1",
                "Project One",
                "freelancer-1",
                "Freelancer User",
                "client-1",
                "Client User",
                ContractStatus.ACTIVE,
                new BigDecimal("500.00"),
                LocalDate.now(),
                LocalDate.now().plusDays(14),
                null,
                0,
                0,
                0,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO
        );
    }

    private void setField(String name, Object value) {
        try {
            Field field = BidService.class.getDeclaredField(name);
            field.setAccessible(true);
            field.set(bidService, value);
        } catch (ReflectiveOperationException e) {
            throw new AssertionError("Failed to set field " + name, e);
        }
    }
}
