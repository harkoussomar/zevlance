package com.freelancehub.freelancehub.dispute.service;

import com.freelancehub.freelancehub.bid.domain.Bid;
import com.freelancehub.freelancehub.contract.domain.Contract;
import com.freelancehub.freelancehub.contract.repository.ContractRepository;
import com.freelancehub.freelancehub.contract.repository.MilestoneRepository;
import com.freelancehub.freelancehub.dispute.domain.DisputeOutcome;
import com.freelancehub.freelancehub.dispute.domain.Dispute;
import com.freelancehub.freelancehub.dispute.domain.DisputeEvidence;
import com.freelancehub.freelancehub.dispute.domain.DisputeMessage;
import com.freelancehub.freelancehub.dispute.domain.DisputeStatus;
import com.freelancehub.freelancehub.dispute.dto.AddEvidenceRequest;
import com.freelancehub.freelancehub.dispute.dto.ChatMessageRequest;
import com.freelancehub.freelancehub.dispute.dto.DisputeDetailsResponse;
import com.freelancehub.freelancehub.dispute.dto.DisputeEvidenceResponse;
import com.freelancehub.freelancehub.dispute.dto.DisputeMessageResponse;
import com.freelancehub.freelancehub.dispute.dto.ResolveDisputeRequest;
import com.freelancehub.freelancehub.dispute.repository.DisputeEvidenceRepository;
import com.freelancehub.freelancehub.dispute.repository.DisputeMessageRepository;
import com.freelancehub.freelancehub.dispute.repository.DisputeRepository;
import com.freelancehub.freelancehub.exception.NotFoundException;
import com.freelancehub.freelancehub.exception.UnauthorizedException;
import com.freelancehub.freelancehub.project.domain.Project;
import com.freelancehub.freelancehub.payment.service.PaymentService;
import com.freelancehub.freelancehub.upload.service.CloudinaryService;
import com.freelancehub.freelancehub.user.domain.Admin;
import com.freelancehub.freelancehub.user.domain.Client;
import com.freelancehub.freelancehub.user.domain.Freelancer;
import com.freelancehub.freelancehub.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DisputeServiceTest {

    @Mock
    private DisputeRepository disputeRepository;

    @Mock
    private DisputeMessageRepository messageRepository;

    @Mock
    private DisputeEvidenceRepository evidenceRepository;

    @Mock
    private ContractRepository contractRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CloudinaryService cloudinaryService;

    @Mock
    private MilestoneRepository milestoneRepository;

    @Mock
    private PaymentService paymentService;

    private DisputeService disputeService;

    @BeforeEach
    void setUp() {
        disputeService = new DisputeService(
                disputeRepository,
                messageRepository,
                evidenceRepository,
                contractRepository,
                userRepository,
                cloudinaryService,
                milestoneRepository,
                paymentService
        );
    }

    @Test
    void createDispute_whenInitiatorIsContractParty_savesOpenDisputeAndSystemMessage() {
        Contract contract = contract("contract-1");
        Client initiator = client("client-1");
        when(contractRepository.findById("contract-1")).thenReturn(Optional.of(contract));
        when(userRepository.findById("client-1")).thenReturn(Optional.of(initiator));
        when(disputeRepository.findByContractId("contract-1")).thenReturn(Optional.empty());
        doAnswer(invocation -> {
            Dispute dispute = invocation.getArgument(0);
            dispute.setId("dispute-1");
            return dispute;
        }).when(disputeRepository).save(any(Dispute.class));

        disputeService.createDispute("contract-1", "client-1", "Scope disagreement");

        ArgumentCaptor<Dispute> disputeCaptor = ArgumentCaptor.forClass(Dispute.class);
        verify(disputeRepository).save(disputeCaptor.capture());
        Dispute saved = disputeCaptor.getValue();
        assertThat(saved.getContract()).isSameAs(contract);
        assertThat(saved.getInitiator()).isSameAs(initiator);
        assertThat(saved.getReason()).isEqualTo("Scope disagreement");
        assertThat(saved.getStatus()).isEqualTo(DisputeStatus.OPEN);

        ArgumentCaptor<DisputeMessage> messageCaptor = ArgumentCaptor.forClass(DisputeMessage.class);
        verify(messageRepository).save(messageCaptor.capture());
        DisputeMessage systemMessage = messageCaptor.getValue();
        assertThat(systemMessage.getDispute()).isSameAs(saved);
        assertThat(systemMessage.getSender()).isNull();
        assertThat(systemMessage.isSystemMessage()).isTrue();
        assertThat(systemMessage.getMessage()).isEqualTo("Client User opened a dispute. Reason: Scope disagreement");
    }

    @Test
    void createDispute_whenInitiatorIsNotContractParty_throwsUnauthorized() {
        when(contractRepository.findById("contract-1")).thenReturn(Optional.of(contract("contract-1")));
        when(userRepository.findById("client-2")).thenReturn(Optional.of(client("client-2")));

        assertThatThrownBy(() -> disputeService.createDispute("contract-1", "client-2", "Scope disagreement"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Only parties to this contract can open a dispute");

        verify(disputeRepository, never()).save(any());
        verifyNoInteractions(messageRepository);
    }

    @Test
    void createDispute_whenDisputeAlreadyExists_throwsIllegalState() {
        Contract contract = contract("contract-1");
        when(contractRepository.findById("contract-1")).thenReturn(Optional.of(contract));
        when(userRepository.findById("client-1")).thenReturn(Optional.of(client("client-1")));
        when(disputeRepository.findByContractId("contract-1")).thenReturn(Optional.of(dispute(contract, DisputeStatus.OPEN)));

        assertThatThrownBy(() -> disputeService.createDispute("contract-1", "client-1", "Scope disagreement"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("A dispute already exists for this contract.");

        verify(disputeRepository, never()).save(any());
        verifyNoInteractions(messageRepository);
    }

    @Test
    void createDispute_whenContractDoesNotExist_throwsNotFound() {
        when(contractRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> disputeService.createDispute("missing", "client-1", "Scope disagreement"))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Contract not found: missing");
    }

    @Test
    void getDisputeDetails_whenCallerIsAdmin_returnsMessagesAndEvidence() {
        Contract contract = contract("contract-1");
        Dispute dispute = dispute(contract, DisputeStatus.OPEN);
        dispute.setId("dispute-1");
        DisputeMessage systemMessage = systemMessage(dispute, "System note");
        systemMessage.setId("msg-1");
        DisputeEvidence evidence = evidence(dispute, client("client-1"));
        evidence.setId("ev-1");
        when(disputeRepository.findByContractId("contract-1")).thenReturn(Optional.of(dispute));
        when(userRepository.findById("admin-1")).thenReturn(Optional.of(admin("admin-1")));
        when(messageRepository.findByDisputeIdOrderByCreatedAtAsc("dispute-1")).thenReturn(List.of(systemMessage));
        when(evidenceRepository.findByDisputeIdOrderByCreatedAtDesc("dispute-1")).thenReturn(List.of(evidence));

        DisputeDetailsResponse response = disputeService.getDisputeDetails("contract-1", "admin-1");

        assertThat(response.id()).isEqualTo("dispute-1");
        assertThat(response.contractId()).isEqualTo("contract-1");
        assertThat(response.status()).isEqualTo(DisputeStatus.OPEN);
        assertThat(response.messages()).hasSize(1);
        assertThat(response.messages().getFirst().senderName()).isEqualTo("System");
        assertThat(response.messages().getFirst().senderRole()).isEqualTo("SYSTEM");
        assertThat(response.messages().getFirst().isSystemMessage()).isTrue();
        assertThat(response.evidence()).hasSize(1);
        assertThat(response.evidence().getFirst().fileName()).isEqualTo("evidence.pdf");
    }

    @Test
    void getDisputeDetails_whenCallerIsNotPartyOrAdmin_throwsUnauthorized() {
        when(disputeRepository.findByContractId("contract-1")).thenReturn(Optional.of(dispute(contract("contract-1"), DisputeStatus.OPEN)));
        when(userRepository.findById("client-2")).thenReturn(Optional.of(client("client-2")));

        assertThatThrownBy(() -> disputeService.getDisputeDetails("contract-1", "client-2"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("You are not authorized to access this dispute");

        verifyNoInteractions(messageRepository, evidenceRepository);
    }

    @Test
    void sendMessage_whenActiveDisputeAndCallerIsParty_savesMessage() {
        Contract contract = contract("contract-1");
        Dispute dispute = dispute(contract, DisputeStatus.OPEN);
        dispute.setId("dispute-1");
        Freelancer sender = freelancer("freelancer-1");
        when(disputeRepository.findByContractId("contract-1")).thenReturn(Optional.of(dispute));
        when(userRepository.findById("freelancer-1")).thenReturn(Optional.of(sender));
        doAnswer(invocation -> {
            DisputeMessage message = invocation.getArgument(0);
            message.setId("msg-1");
            return message;
        }).when(messageRepository).save(any(DisputeMessage.class));

        DisputeMessageResponse response = disputeService.sendMessage(
                "contract-1",
                "freelancer-1",
                new ChatMessageRequest("Here is my explanation.")
        );

        assertThat(response.id()).isEqualTo("msg-1");
        assertThat(response.senderId()).isEqualTo("freelancer-1");
        assertThat(response.senderRole()).isEqualTo("FREELANCER");
        assertThat(response.message()).isEqualTo("Here is my explanation.");
        assertThat(response.isSystemMessage()).isFalse();
    }

    @Test
    void sendMessage_whenDisputeIsResolved_throwsReadOnlyErrorBeforeLoadingUser() {
        when(disputeRepository.findByContractId("contract-1")).thenReturn(Optional.of(dispute(contract("contract-1"), DisputeStatus.RESOLVED)));

        assertThatThrownBy(() -> disputeService.sendMessage("contract-1", "client-1", new ChatMessageRequest("Message")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Dispute is already resolved and read-only.");

        verifyNoInteractions(userRepository, messageRepository);
    }

    @Test
    void addEvidence_whenActiveDisputeAndCallerIsParty_verifiesAssetSavesEvidenceAndSystemMessage() {
        Contract contract = contract("contract-1");
        Dispute dispute = dispute(contract, DisputeStatus.OPEN);
        dispute.setId("dispute-1");
        Client uploader = client("client-1");
        when(disputeRepository.findByContractId("contract-1")).thenReturn(Optional.of(dispute));
        when(userRepository.findById("client-1")).thenReturn(Optional.of(uploader));
        doAnswer(invocation -> {
            DisputeEvidence evidence = invocation.getArgument(0);
            evidence.setId("ev-1");
            return evidence;
        }).when(evidenceRepository).save(any(DisputeEvidence.class));

        AddEvidenceRequest request = new AddEvidenceRequest(
                "disputes/contract-1/evidence-1",
                "https://res.cloudinary.test/evidence.pdf",
                "evidence.pdf",
                "Signed statement of work"
        );

        DisputeEvidenceResponse response = disputeService.addEvidence("contract-1", "client-1", request);

        verify(cloudinaryService).verifyAsset("disputes/contract-1/evidence-1");
        assertThat(response.id()).isEqualTo("ev-1");
        assertThat(response.uploaderId()).isEqualTo("client-1");
        assertThat(response.fileUrl()).isEqualTo("https://res.cloudinary.test/evidence.pdf");

        ArgumentCaptor<DisputeMessage> messageCaptor = ArgumentCaptor.forClass(DisputeMessage.class);
        verify(messageRepository).save(messageCaptor.capture());
        assertThat(messageCaptor.getValue().getSender()).isNull();
        assertThat(messageCaptor.getValue().isSystemMessage()).isTrue();
        assertThat(messageCaptor.getValue().getMessage()).isEqualTo("Client User uploaded evidence: evidence.pdf");
    }

    @Test
    void addEvidence_whenCloudinaryRejectsAsset_propagatesWithoutSavingEvidence() {
        when(disputeRepository.findByContractId("contract-1")).thenReturn(Optional.of(dispute(contract("contract-1"), DisputeStatus.OPEN)));
        when(userRepository.findById("client-1")).thenReturn(Optional.of(client("client-1")));
        doThrow(new IllegalArgumentException("Invalid asset")).when(cloudinaryService).verifyAsset("bad-public-id");

        assertThatThrownBy(() -> disputeService.addEvidence("contract-1", "client-1",
                new AddEvidenceRequest("bad-public-id", "https://res.cloudinary.test/evidence.pdf", "evidence.pdf", null)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid asset");

        verify(evidenceRepository, never()).save(any());
        verifyNoInteractions(messageRepository);
    }

    @Test
    void escalateToAdmin_whenOpenDisputeAndCallerIsParty_marksEscalatedAndWritesSystemMessage() {
        Dispute dispute = dispute(contract("contract-1"), DisputeStatus.OPEN);
        when(disputeRepository.findByContractId("contract-1")).thenReturn(Optional.of(dispute));
        when(userRepository.findById("freelancer-1")).thenReturn(Optional.of(freelancer("freelancer-1")));

        disputeService.escalateToAdmin("contract-1", "freelancer-1");

        assertThat(dispute.getStatus()).isEqualTo(DisputeStatus.ESCALATED);
        ArgumentCaptor<DisputeMessage> captor = ArgumentCaptor.forClass(DisputeMessage.class);
        verify(messageRepository).save(captor.capture());
        assertThat(captor.getValue().getSender()).isNull();
        assertThat(captor.getValue().isSystemMessage()).isTrue();
        assertThat(captor.getValue().getMessage())
                .isEqualTo("Freelancer User escalated this dispute to the Admin team. Please wait for an Admin to join the chat.");
    }

    @Test
    void escalateToAdmin_whenAlreadyEscalated_throwsIllegalState() {
        when(disputeRepository.findByContractId("contract-1")).thenReturn(Optional.of(dispute(contract("contract-1"), DisputeStatus.ESCALATED)));
        when(userRepository.findById("client-1")).thenReturn(Optional.of(client("client-1")));

        assertThatThrownBy(() -> disputeService.escalateToAdmin("contract-1", "client-1"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("This dispute has already been escalated to an admin.");

        verifyNoInteractions(messageRepository);
    }

    @Test
    void escalateToAdmin_whenResolved_throwsReadOnlyError() {
        when(disputeRepository.findByContractId("contract-1")).thenReturn(Optional.of(dispute(contract("contract-1"), DisputeStatus.RESOLVED)));

        assertThatThrownBy(() -> disputeService.escalateToAdmin("contract-1", "client-1"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Dispute is already resolved and read-only.");

        verifyNoInteractions(userRepository, messageRepository);
    }

    @Test
    void resolveDispute_whenCallerIsAdmin_marksResolvedAndWritesAuditTrail() {
        Dispute dispute = dispute(contract("contract-1"), DisputeStatus.ESCALATED);
        Admin admin = admin("admin-1");
        when(disputeRepository.findByContractId("contract-1")).thenReturn(Optional.of(dispute));
        when(userRepository.findById("admin-1")).thenReturn(Optional.of(admin));

        disputeService.resolveDispute("contract-1", "admin-1",
                new ResolveDisputeRequest(DisputeOutcome.CLIENT_WINS, "Refund the client based on the evidence."));

        assertThat(dispute.getStatus()).isEqualTo(DisputeStatus.RESOLVED);
        assertThat(dispute.getResolvedBy()).isSameAs(admin);
        assertThat(dispute.getResolvedAt()).isNotNull();
        ArgumentCaptor<DisputeMessage> captor = ArgumentCaptor.forClass(DisputeMessage.class);
        verify(messageRepository).save(captor.capture());
        assertThat(captor.getValue().getSender()).isNull();
        assertThat(captor.getValue().getMessage()).isEqualTo(
                "Admin Admin User resolved this dispute for CLIENT_WINS. Note: Refund the client based on the evidence.");
        verify(paymentService).refundAllFundedMilestones("contract-1");
    }

    @Test
    void resolveDispute_whenCallerIsNotAdmin_throwsUnauthorized() {
        when(disputeRepository.findByContractId("contract-1")).thenReturn(Optional.of(dispute(contract("contract-1"), DisputeStatus.ESCALATED)));
        when(userRepository.findById("client-1")).thenReturn(Optional.of(client("client-1")));

        assertThatThrownBy(() -> disputeService.resolveDispute("contract-1", "client-1",
                new ResolveDisputeRequest(DisputeOutcome.CLIENT_WINS, "Refund the client based on the evidence.")))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("Only admins can resolve disputes");

        verifyNoInteractions(messageRepository);
    }

    @Test
    void resolveDispute_whenAlreadyResolved_throwsIllegalState() {
        when(disputeRepository.findByContractId("contract-1")).thenReturn(Optional.of(dispute(contract("contract-1"), DisputeStatus.RESOLVED)));
        when(userRepository.findById("admin-1")).thenReturn(Optional.of(admin("admin-1")));

        assertThatThrownBy(() -> disputeService.resolveDispute("contract-1", "admin-1",
                new ResolveDisputeRequest(DisputeOutcome.CLIENT_WINS, "Refund the client based on the evidence.")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("This dispute is already resolved.");

        verifyNoInteractions(messageRepository);
    }

    @Test
    void getDisputeDetails_whenDisputeDoesNotExist_throwsNotFound() {
        when(disputeRepository.findByContractId("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> disputeService.getDisputeDetails("missing", "client-1"))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Dispute not found for contract: missing");
    }

    @Test
    void sendMessage_whenUserDoesNotExist_throwsNotFound() {
        when(disputeRepository.findByContractId("contract-1")).thenReturn(Optional.of(dispute(contract("contract-1"), DisputeStatus.OPEN)));
        when(userRepository.findById("missing-user")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> disputeService.sendMessage("contract-1", "missing-user", new ChatMessageRequest("Message")))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("User not found: missing-user");
    }

    private Contract contract(String id) {
        Client client = client("client-1");
        Freelancer freelancer = freelancer("freelancer-1");

        Project project = new Project();
        project.setId("project-1");
        project.setTitle("Project One");
        project.setClient(client);

        Bid bid = new Bid();
        bid.setId("bid-1");
        bid.setProject(project);
        bid.setFreelancer(freelancer);

        Contract contract = new Contract();
        contract.setId(id);
        contract.setBid(bid);
        contract.setClient(client);
        contract.setFreelancer(freelancer);
        return contract;
    }

    private Dispute dispute(Contract contract, DisputeStatus status) {
        Dispute dispute = new Dispute();
        dispute.setId("dispute-1");
        dispute.setContract(contract);
        dispute.setInitiator(client("client-1"));
        dispute.setReason("Scope disagreement");
        dispute.setStatus(status);
        return dispute;
    }

    private DisputeMessage systemMessage(Dispute dispute, String messageText) {
        DisputeMessage message = new DisputeMessage();
        message.setDispute(dispute);
        message.setSender(null);
        message.setMessage(messageText);
        message.setSystemMessage(true);
        return message;
    }

    private DisputeEvidence evidence(Dispute dispute, Client uploader) {
        DisputeEvidence evidence = new DisputeEvidence();
        evidence.setDispute(dispute);
        evidence.setUploader(uploader);
        evidence.setFileName("evidence.pdf");
        evidence.setFileUrl("https://res.cloudinary.test/evidence.pdf");
        evidence.setPublicId("disputes/contract-1/evidence-1");
        evidence.setDescription("Signed statement of work");
        return evidence;
    }

    private Client client(String id) {
        Client client = new Client();
        client.setId(id);
        client.setName("Client User");
        client.setEmail(id + "@example.com");
        return client;
    }

    private Freelancer freelancer(String id) {
        Freelancer freelancer = new Freelancer();
        freelancer.setId(id);
        freelancer.setName("Freelancer User");
        freelancer.setEmail(id + "@example.com");
        return freelancer;
    }

    private Admin admin(String id) {
        Admin admin = new Admin();
        admin.setId(id);
        admin.setName("Admin User");
        admin.setEmail(id + "@example.com");
        return admin;
    }
}
