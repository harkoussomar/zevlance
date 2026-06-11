package com.freelancehub.freelancehub.contract.service;

import com.freelancehub.freelancehub.bid.domain.Bid;
import com.freelancehub.freelancehub.contract.domain.Contract;
import com.freelancehub.freelancehub.contract.domain.ContractStatus;
import com.freelancehub.freelancehub.contract.domain.Milestone;
import com.freelancehub.freelancehub.contract.domain.MilestoneStatus;
import com.freelancehub.freelancehub.contract.dto.ContractMilestoneStats;
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
import com.freelancehub.freelancehub.notification.service.EmailTemplates;
import com.freelancehub.freelancehub.notification.service.NotificationService;
import com.freelancehub.freelancehub.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContractService {

    private final ContractRepository contractRepository;
    private final MilestoneRepository milestoneRepository;
    private final PaymentService paymentService;
    private final NotificationService notificationService;
    private final DisputeService disputeService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Transactional
    public ContractResponse createContract(Bid bid) {
        // ... (Keep existing createContract code) ...
        Contract contract = new Contract();
        LocalDate startDate  = LocalDate.now();
        Integer durationDays = bid.getEstimatedDays();
        if (durationDays == null || durationDays <= 0) throw new IllegalStateException("Invalid bid duration");
        contract.setAgreedPrice(bid.getProposedPrice());
        contract.setStartDate(startDate);
        contract.setEndDate(startDate.plusDays(durationDays));
        contract.setStatus(ContractStatus.ACTIVE);
        contract.setBid(bid);
        contract.setFreelancer(bid.getFreelancer());
        contract.setClient(bid.getProject().getClient());
        contractRepository.save(contract);
        return toResponse(contract, ContractMilestoneStats.empty());
    }

    @Transactional(readOnly = true)
    public Page<ContractResponse> getMyContracts(String userId, ContractStatus status, Pageable pageable) {
        // ... (Keep existing getMyContracts code) ...
        Page<Contract> contractPage = (status == null)
                ? contractRepository.findAllByUserId(userId, pageable)
                : contractRepository.findAllByUserIdAndStatus(userId, status, pageable);
        if (contractPage.isEmpty()) return contractPage.map(c -> null);
        List<String> contractIds = contractPage.getContent().stream().map(Contract::getId).toList();
        Map<String, List<Milestone>> milestonesByContract = milestoneRepository.findByContractIdIn(contractIds).stream()
                .collect(Collectors.groupingBy(m -> m.getContract().getId()));
        return contractPage.map(c -> toResponse(c, ContractMilestoneStats.from(milestonesByContract.getOrDefault(c.getId(), List.of()))));
    }

    @Transactional(readOnly = true)
    public ContractSummaryResponse getMyContractsSummary(String userId) {
        // ... (Keep existing getMyContractsSummary code) ...
        List<Contract> all = contractRepository.findAllByUserId(userId);
        long active = 0, completed = 0, disputed = 0, cancelled = 0;
        BigDecimal activeValue = BigDecimal.ZERO, clientReleased = BigDecimal.ZERO, freelancerEarned = BigDecimal.ZERO;
        List<String> allIds = all.stream().map(Contract::getId).toList();
        Map<String, List<Milestone>> milestonesByContract = allIds.isEmpty() ? Map.of() : milestoneRepository.findByContractIdIn(allIds).stream()
                                                                                          .collect(Collectors.groupingBy(m -> m.getContract().getId()));
        for (Contract c : all) {
            switch (c.getStatus()) {
                case ACTIVE    -> { active++; activeValue = activeValue.add(c.getAgreedPrice()); }
                case COMPLETED -> completed++;
                case DISPUTED  -> disputed++;
                case CANCELLED -> cancelled++;
            }
            ContractMilestoneStats stats = ContractMilestoneStats.from(milestonesByContract.getOrDefault(c.getId(), List.of()));
            clientReleased = clientReleased.add(stats.clientTotalReleased());
            freelancerEarned = freelancerEarned.add(stats.freelancerTotalEarned());
        }
        return new ContractSummaryResponse(all.size(), active, completed, disputed, cancelled, activeValue, clientReleased, freelancerEarned);
    }

    @Transactional(readOnly = true)
    public ContractResponse getContract(String contractId, String userId) {
        Contract contract = findContractById(contractId);
        assertParty(contract, userId);
        return toResponse(contract, statsFor(contractId));
    }

    // ✅ FIX: Block completion if milestones are left stranded in escrow
    @PreAuthorize("hasRole('CLIENT')")
    @Transactional
    public ContractResponse completeContract(String contractId, String clientId) {
        return completeContractInternal(contractId, clientId);
    }

    @Transactional
    public ContractResponse completeContractInternal(String contractId, String clientId) {
        Contract contract = findContractByIdForUpdate(contractId);
        assertClient(contract, clientId);

        if (contract.getStatus() != ContractStatus.ACTIVE) {
            throw new IllegalStateException("Only ACTIVE contracts can be completed");
        }

        // Check for stranded milestones
        boolean hasUnresolvedMilestones = milestoneRepository.findByContractId(contractId).stream()
                .anyMatch(m -> m.getStatus() == MilestoneStatus.PENDING ||
                        m.getStatus() == MilestoneStatus.FUNDED ||
                        m.getStatus() == MilestoneStatus.SUBMITTED ||
                        m.getStatus() == MilestoneStatus.REVISION_REQUESTED);

        if (hasUnresolvedMilestones) {
            throw new IllegalStateException("Cannot complete contract. You have active or funded milestones. Please approve, refund, or dispute them first.");
        }

        contract.setStatus(ContractStatus.COMPLETED);
        contract.setEndDate(LocalDate.now());
        return toResponse(contract, statsFor(contractId));
    }

    // ✅ FIX: Prevent malicious cancellations & call Stripe directly
    @Transactional
    public ContractResponse cancelContract(String contractId, String userId) {
        Contract contract = findContractByIdForUpdate(contractId);
        assertParty(contract, userId);

        if (contract.getStatus() != ContractStatus.ACTIVE) {
            throw new IllegalStateException("Only ACTIVE contracts can be cancelled");
        }

        // Prevent Cancellation Theft
        boolean hasLockedFunds = milestoneRepository.findByContractId(contractId).stream()
                .anyMatch(m -> m.getStatus() == MilestoneStatus.SUBMITTED ||
                        m.getStatus() == MilestoneStatus.REVISION_REQUESTED ||
                        m.getStatus() == MilestoneStatus.DISPUTED);

        if (hasLockedFunds) {
            throw new IllegalStateException("Cannot cancel contract. Work has been submitted or is in dispute. Please approve or open a formal dispute.");
        }

        contract.setStatus(ContractStatus.CANCELLED);
        contract.setEndDate(LocalDate.now());

        // ✅ Direct Call (Synchronous with Stripe Idempotency, no afterCommit)
        paymentService.refundAllFundedMilestones(contractId);

        // ... (Keep existing notification code) ...
        String projectTitle = contract.getBid().getProject().getTitle();
        notificationService.notifyWithEmail(
                contract.getBid().getProject().getClient().getId(), contract.getBid().getProject().getClient().getEmail(),
                NotificationType.CONTRACT_CANCELLED, "Contract cancelled", "The contract for \"" + projectTitle + "\" has been cancelled.", contractId, ReferenceType.CONTRACT, "Contract cancelled",
                EmailTemplates.contractCancelled(contract.getBid().getProject().getClient().getName(), projectTitle, frontendUrl + "/client/contracts/" + contractId)
        );
        notificationService.notifyWithEmail(
                contract.getBid().getFreelancer().getId(), contract.getBid().getFreelancer().getEmail(),
                NotificationType.CONTRACT_CANCELLED, "Contract cancelled", "The contract for \"" + projectTitle + "\" has been cancelled.", contractId, ReferenceType.CONTRACT, "Contract cancelled",
                EmailTemplates.contractCancelled(contract.getBid().getFreelancer().getName(), projectTitle, frontendUrl + "/freelancer/contracts/" + contractId)
        );

        return toResponse(contract, statsFor(contractId));
    }

    @Transactional
    public ContractResponse disputeContract(String contractId, String userId, OpenDisputeRequest request) {
        Contract contract = findContractByIdForUpdate(contractId);
        assertParty(contract, userId);

        if (contract.getStatus() != ContractStatus.ACTIVE) {
            throw new IllegalStateException("Only ACTIVE contracts can be disputed");
        }

        // 1. Set contract status to disputed
        contract.setStatus(ContractStatus.DISPUTED);

        // 2. CREATE THE DISPUTE ROOM
        disputeService.createDispute(contractId, userId, request.reason());

        // 3. Send Emails
        String projectTitle = contract.getBid().getProject().getTitle();

        notificationService.notifyWithEmail(contract.getBid().getProject().getClient().getId(), contract.getBid().getProject().getClient().getEmail(), NotificationType.CONTRACT_DISPUTED, "Contract disputed", "The contract for \"" + projectTitle + "\" is now under dispute.", contractId, ReferenceType.CONTRACT, "Contract disputed", EmailTemplates.contractDisputed(contract.getBid().getProject().getClient().getName(), projectTitle, frontendUrl + "/client/contracts/" + contractId));
        notificationService.notifyWithEmail(contract.getBid().getFreelancer().getId(), contract.getBid().getFreelancer().getEmail(), NotificationType.CONTRACT_DISPUTED, "Contract disputed", "The contract for \"" + projectTitle + "\" is now under dispute.", contractId, ReferenceType.CONTRACT, "Contract disputed", EmailTemplates.contractDisputed(contract.getBid().getFreelancer().getName(), projectTitle, frontendUrl + "/freelancer/contracts/" + contractId));

        return toResponse(contract, statsFor(contractId));
    }

    public Contract findContractById(String id) {
        return contractRepository.findById(id).orElseThrow(() -> new NotFoundException("Contract not found: " + id));
    }

    public Contract findContractByIdForUpdate(String id) {
        return contractRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new NotFoundException("Contract not found: " + id));
    }

    private ContractMilestoneStats statsFor(String contractId) {
        return ContractMilestoneStats.from(milestoneRepository.findByContractId(contractId));
    }

    private void assertParty(Contract contract, String userId) {
        if (!contract.getBid().getFreelancer().getId().equals(userId) && !contract.getBid().getProject().getClient().getId().equals(userId)) {
            throw new UnauthorizedException("You are not a party to this contract");
        }
    }

    private void assertClient(Contract contract, String clientId) {
        if (!contract.getBid().getProject().getClient().getId().equals(clientId)) {
            throw new UnauthorizedException("Only the client can perform this action");
        }
    }

    public ContractResponse toResponse(Contract c, ContractMilestoneStats stats) {
        return new ContractResponse(c.getId(), c.getBid().getId(), c.getBid().getProject().getId(), c.getBid().getProject().getTitle(), c.getBid().getFreelancer().getId(), c.getBid().getFreelancer().getName(), c.getBid().getProject().getClient().getId(), c.getBid().getProject().getClient().getName(), c.getStatus(), c.getAgreedPrice(), c.getStartDate(), c.getEndDate(), c.getCreatedAt(), stats.totalMilestones(), stats.approvedCount(), stats.pendingReviewCount(), stats.totalAllocated(), stats.clientTotalReleased(), stats.freelancerTotalEarned());
    }
}
