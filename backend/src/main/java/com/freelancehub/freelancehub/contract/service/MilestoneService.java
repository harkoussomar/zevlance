package com.freelancehub.freelancehub.contract.service;

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
import com.freelancehub.freelancehub.notification.service.EmailTemplates;
import com.freelancehub.freelancehub.notification.service.NotificationService;
import com.freelancehub.freelancehub.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MilestoneService {

    private static final int MAX_REVISIONS = 3;

    private final MilestoneRepository milestoneRepository;
    private final ContractService contractService;
    private final PaymentService paymentService;
    private final NotificationService notificationService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @PreAuthorize("hasRole('CLIENT')")
    @Transactional
    public MilestoneResponse createMilestone(String contractId, CreateMilestoneRequest request, String clientId) {
        Contract contract = contractService.findContractByIdForUpdate(contractId);
        assertClient(contract, clientId);

        if (contract.getStatus() != ContractStatus.ACTIVE) {
            throw new IllegalStateException("Milestones can only be added to ACTIVE contracts");
        }

        // Stripe minimum transaction limit
        if (request.amount().compareTo(BigDecimal.valueOf(5.00)) < 0) {
            throw new IllegalArgumentException("Milestone amount must be at least $5.00.");
        }

        // Ignore REFUNDED milestones when calculating remaining budget
        BigDecimal currentTotal = milestoneRepository.findByContractId(contractId)
                .stream()
                .filter(m -> m.getStatus() != MilestoneStatus.REFUNDED)
                .map(Milestone::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal newTotal = currentTotal.add(request.amount());
        if (newTotal.compareTo(contract.getAgreedPrice()) > 0) {
            BigDecimal remaining = contract.getAgreedPrice().subtract(currentTotal);
            throw new IllegalStateException(String.format(
                    "Cannot add milestone of $%.2f — only $%.2f remaining in the contract budget.",
                    request.amount(), remaining
            ));
        }

        Milestone milestone = new Milestone();
        milestone.setContract(contract);
        milestone.setTitle(request.title());
        milestone.setDescription(request.description());
        milestone.setAmount(request.amount());
        milestone.setDueDate(request.dueDate());
        milestoneRepository.save(milestone);
        return toResponse(milestone);
    }

    @Transactional(readOnly = true)
    public List<MilestoneResponse> getMilestones(String contractId, String userId) {
        Contract contract = contractService.findContractById(contractId);
        assertParty(contract, userId);

        return milestoneRepository.findByContractId(contractId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @PreAuthorize("hasRole('FREELANCER')")
    @Transactional
    public MilestoneResponse submitDeliverable(String milestoneId, SubmitDeliverableRequest request, String freelancerId) {
        Milestone milestone = findMilestoneById(milestoneId);
        assertFreelancer(milestone, freelancerId);
        assertActiveContract(milestone.getContract());

        String clientId    = milestone.getContract().getBid().getProject().getClient().getId();
        String clientEmail = milestone.getContract().getBid().getProject().getClient().getEmail();
        String contractId  = milestone.getContract().getId();

        if (milestone.getStatus() != MilestoneStatus.FUNDED
                && milestone.getStatus() != MilestoneStatus.REVISION_REQUESTED) {
            throw new IllegalStateException(
                    "Deliverable can only be submitted when milestone is FUNDED or REVISION_REQUESTED. " +
                            "Current status: " + milestone.getStatus()
            );
        }

        milestone.setDeliverableUrl(request.deliverableUrl());
        milestone.setStatus(MilestoneStatus.SUBMITTED);

        notificationService.notifyWithEmail(
                clientId, clientEmail,
                NotificationType.MILESTONE_SUBMITTED,
                "Deliverable submitted for review",
                milestone.getContract().getBid().getFreelancer().getName()
                        + " submitted \"" + milestone.getTitle() + "\"",
                milestone.getId(),
                ReferenceType.MILESTONE,
                "Deliverable ready for review",
                EmailTemplates.milestoneSubmitted(
                        milestone.getContract().getBid().getProject().getClient().getName(),
                        milestone.getContract().getBid().getFreelancer().getName(),
                        milestone.getTitle(),
                        frontendUrl + "/client/contracts/" + contractId
                )
        );

        return toResponse(milestone);
    }

    @PreAuthorize("hasRole('CLIENT')")
    @Transactional
    public MilestoneResponse approveMilestone(String milestoneId, String clientId) {
        Milestone milestone = findMilestoneById(milestoneId);
        assertClient(milestone, clientId);
        assertActiveContract(milestone.getContract());

        if (milestone.getStatus() != MilestoneStatus.SUBMITTED) {
            throw new IllegalStateException("Only SUBMITTED milestones can be approved");
        }

        milestone.setStatus(MilestoneStatus.APPROVED);

        // Directly call payment release (It now uses Idempotency Keys inside PaymentService)
        paymentService.releasePayment(milestone);

        autoCompleteContractIfDone(milestone.getContract(), clientId);

        String freelancerId = milestone.getContract().getBid().getFreelancer().getId();
        String freeEmail = milestone.getContract().getBid().getFreelancer().getEmail();

        notificationService.notifyWithEmail(
                freelancerId, freeEmail,
                NotificationType.MILESTONE_APPROVED,
                "Milestone approved — payment released 💰",
                "\"" + milestone.getTitle() + "\" approved. $"
                        + milestone.getFreelancerPayout() + " transferred to your account.",
                milestone.getId(),
                ReferenceType.MILESTONE,
                "Milestone approved — payment released",
                EmailTemplates.milestoneApproved(
                        milestone.getContract().getBid().getFreelancer().getName(),
                        milestone.getTitle(),
                        milestone.getFreelancerPayout().toPlainString(),
                        frontendUrl + "/freelancer/contracts/" + milestone.getContract().getId()
                )
        );

        return toResponse(milestone);
    }

    @PreAuthorize("hasRole('CLIENT')")
    @Transactional
    public MilestoneResponse refundMilestone(String milestoneId, String clientId) {
        Milestone milestone = findMilestoneById(milestoneId);
        assertClient(milestone, clientId);
        assertActiveContract(milestone.getContract());

        if (milestone.getStatus() != MilestoneStatus.FUNDED) {
            throw new IllegalStateException("Only FUNDED milestones can be directly refunded. Use Dispute for submitted milestones.");
        }

        if (milestone.getDeliverableUrl() != null) {
            throw new IllegalStateException("Cannot refund milestone after work has been submitted.");
        }

        paymentService.refundPayment(milestone);

        return toResponse(milestone);
    }

    @PreAuthorize("hasRole('CLIENT')")
    @Transactional
    public MilestoneResponse requestRevision(String milestoneId, String clientId) {
        Milestone milestone = findMilestoneById(milestoneId);
        assertClient(milestone, clientId);
        assertActiveContract(milestone.getContract());

        if (milestone.getStatus() != MilestoneStatus.SUBMITTED) {
            throw new IllegalStateException("Revision can only be requested on SUBMITTED milestones");
        }

        int newCount = milestone.getRevisionCount() + 1;
        String freelancerId = milestone.getContract().getBid().getFreelancer().getId();

        if (newCount >= MAX_REVISIONS) {
            milestone.setStatus(MilestoneStatus.DISPUTED);
            milestone.setRevisionCount(newCount);

            notificationService.notify(
                    freelancerId,
                    NotificationType.MILESTONE_DISPUTED,
                    "Milestone escalated to dispute",
                    "Max revisions reached on \"" + milestone.getTitle() + "\". Funds are frozen pending review.",
                    milestone.getId(),
                    ReferenceType.MILESTONE
            );

            return toResponse(milestone);
        }

        milestone.setStatus(MilestoneStatus.REVISION_REQUESTED);
        milestone.setRevisionCount(newCount);

        notificationService.notify(
                freelancerId,
                NotificationType.MILESTONE_REVISION_REQUESTED,
                "Revision requested",
                "The client requested a revision on \"" + milestone.getTitle() + "\".",
                milestone.getId(),
                ReferenceType.MILESTONE
        );

        return toResponse(milestone);
    }

    private void autoCompleteContractIfDone(Contract contract, String clientId) {
        List<Milestone> allMilestones = milestoneRepository.findByContractId(contract.getId());

        // Don't block auto-completion if there's a REFUNDED milestone.
        boolean hasUnresolvedMilestones = allMilestones.stream()
                .anyMatch(m -> m.getStatus() != MilestoneStatus.APPROVED
                        && m.getStatus() != MilestoneStatus.REFUNDED);

        if (hasUnresolvedMilestones) return;

        BigDecimal approvedTotal = allMilestones.stream()
                .filter(m -> m.getStatus() == MilestoneStatus.APPROVED)
                .map(Milestone::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (approvedTotal.compareTo(contract.getAgreedPrice()) >= 0) {
            contractService.completeContractInternal(contract.getId(), clientId);
        }
    }

    public Milestone findMilestoneById(String id) {
        return milestoneRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Milestone not found: " + id));
    }

    private void assertClient(Contract contract, String clientId) {
        if (!contract.getBid().getProject().getClient().getId().equals(clientId)) {
            throw new UnauthorizedException("Only the client can perform this action");
        }
    }

    private void assertClient(Milestone milestone, String clientId) {
        assertClient(milestone.getContract(), clientId);
    }

    private void assertFreelancer(Milestone milestone, String freelancerId) {
        if (!milestone.getContract().getBid().getFreelancer().getId().equals(freelancerId)) {
            throw new UnauthorizedException("Only the freelancer can perform this action");
        }
    }

    private void assertParty(Contract contract, String userId) {
        boolean isFreelancer = contract.getBid().getFreelancer().getId().equals(userId);
        boolean isClient = contract.getBid().getProject().getClient().getId().equals(userId);
        if (!isFreelancer && !isClient) {
            throw new UnauthorizedException("You are not a party to this contract");
        }
    }

    private void assertActiveContract(Contract contract) {
        if (contract.getStatus() != ContractStatus.ACTIVE) {
            throw new IllegalStateException("Milestone actions are only allowed on ACTIVE contracts");
        }
    }

    public MilestoneResponse toResponse(Milestone m) {
        return new MilestoneResponse(
                m.getId(),
                m.getContract().getId(),
                m.getTitle(),
                m.getDescription(),
                m.getAmount(),
                m.getStatus(),
                m.getDueDate(),
                m.getDeliverableUrl(),
                m.getPlatformFeeAmount(),
                m.getFreelancerPayout(),
                m.getFundedAt(),
                m.getReleasedAt(),
                m.getRevisionCount(),
                m.getRefundStatus()
        );
    }
}
