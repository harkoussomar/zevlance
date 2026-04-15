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
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

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

    @Value("${app.frontend-url}")
    private String frontendUrl;

    // ─── Public API ────────────────────────────────────────────────────────────

    @Transactional
    public ContractResponse createContract(Bid bid) {
        Contract contract = new Contract();

        LocalDate startDate  = LocalDate.now();
        Integer durationDays = bid.getEstimatedDays();

        if (durationDays == null || durationDays <= 0) {
            throw new IllegalStateException("Invalid bid duration");
        }

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

    /**
     * Paginated contract list for a user, optionally filtered by status.
     * Two queries per page regardless of page size:
     *   1. SELECT contracts WHERE userId = ? [AND status = ?] LIMIT ? OFFSET ?
     *   2. SELECT milestones WHERE contractId IN (ids on this page)
     */
    @Transactional(readOnly = true)
    public Page<ContractResponse> getMyContracts(String userId, ContractStatus status, Pageable pageable) {
        Page<Contract> contractPage = (status == null)
                ? contractRepository.findAllByUserId(userId, pageable)
                : contractRepository.findAllByUserIdAndStatus(userId, status, pageable);

        if (contractPage.isEmpty()) return contractPage.map(c -> null); // keeps Page metadata intact

        List<String> contractIds = contractPage.getContent().stream()
                .map(Contract::getId)
                .toList();

        // Bulk milestone fetch — avoids N+1 per card
        Map<String, List<Milestone>> milestonesByContract = milestoneRepository
                .findByContractIdIn(contractIds)
                .stream()
                .collect(Collectors.groupingBy(m -> m.getContract().getId()));

        return contractPage.map(c -> toResponse(
                c,
                ContractMilestoneStats.from(milestonesByContract.getOrDefault(c.getId(), List.of()))
        ));
    }

    /**
     * Full-history aggregate for the stat cards — independent of pagination.
     * Uses a single projection query; does NOT load contract or milestone entities.
     */
    @Transactional(readOnly = true)
    public ContractSummaryResponse getMyContractsSummary(String userId) {
        List<Contract> all = contractRepository.findAllByUserId(userId);

        long active = 0, completed = 0, disputed = 0, cancelled = 0;
        BigDecimal activeValue       = BigDecimal.ZERO;
        BigDecimal clientReleased    = BigDecimal.ZERO;
        BigDecimal freelancerEarned  = BigDecimal.ZERO;

        // Collect ids of ACTIVE contracts to bulk-fetch their milestones
        List<String> allIds = all.stream().map(Contract::getId).toList();

        Map<String, List<Milestone>> milestonesByContract = allIds.isEmpty()
                ? Map.of()
                : milestoneRepository.findByContractIdIn(allIds)
                  .stream()
                  .collect(Collectors.groupingBy(m -> m.getContract().getId()));

        for (Contract c : all) {
            switch (c.getStatus()) {
                case ACTIVE    -> { active++;    activeValue = activeValue.add(c.getAgreedPrice()); }
                case COMPLETED -> completed++;
                case DISPUTED  -> disputed++;
                case CANCELLED -> cancelled++;
            }

            ContractMilestoneStats stats = ContractMilestoneStats.from(
                    milestonesByContract.getOrDefault(c.getId(), List.of())
            );
            clientReleased   = clientReleased.add(stats.clientTotalReleased());
            freelancerEarned = freelancerEarned.add(stats.freelancerTotalEarned());
        }

        return new ContractSummaryResponse(
                all.size(),
                active, completed, disputed, cancelled,
                activeValue,
                clientReleased,
                freelancerEarned
        );
    }

    @Transactional(readOnly = true)
    public ContractResponse getContract(String contractId, String userId) {
        Contract contract = findContractById(contractId);
        assertParty(contract, userId);
        return toResponse(contract, statsFor(contractId));
    }

    @PreAuthorize("hasRole('CLIENT')")
    @Transactional
    public ContractResponse completeContract(String contractId, String clientId) {
        Contract contract = findContractById(contractId);
        assertClient(contract, clientId);

        if (contract.getStatus() != ContractStatus.ACTIVE) {
            throw new IllegalStateException("Only ACTIVE contracts can be completed");
        }

        contract.setStatus(ContractStatus.COMPLETED);
        contract.setEndDate(LocalDate.now());
        return toResponse(contract, statsFor(contractId));
    }

    @Transactional
    public ContractResponse completeContractInternal(String contractId, String clientId) {
        Contract contract = findContractById(contractId);
        assertClient(contract, clientId);

        if (contract.getStatus() != ContractStatus.ACTIVE) {
            throw new IllegalStateException("Only ACTIVE contracts can be completed");
        }

        contract.setStatus(ContractStatus.COMPLETED);
        contract.setEndDate(LocalDate.now());
        return toResponse(contract, statsFor(contractId));
    }

    @Transactional
    public ContractResponse cancelContract(String contractId, String userId) {
        Contract contract = findContractById(contractId);
        assertParty(contract, userId);

        if (contract.getStatus() != ContractStatus.ACTIVE) {
            throw new IllegalStateException("Only ACTIVE contracts can be cancelled");
        }

        contract.setStatus(ContractStatus.CANCELLED);
        contract.setEndDate(LocalDate.now());

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                paymentService.refundAllFundedMilestones(contractId);
            }
        });

        String projectTitle = contract.getBid().getProject().getTitle();
        String clientId     = contract.getBid().getProject().getClient().getId();
        String clientEmail  = contract.getBid().getProject().getClient().getEmail();
        String freelancerId = contract.getBid().getFreelancer().getId();
        String freeEmail    = contract.getBid().getFreelancer().getEmail();

        notificationService.notifyWithEmail(
                clientId, clientEmail,
                NotificationType.CONTRACT_CANCELLED,
                "Contract cancelled",
                "The contract for \"" + projectTitle + "\" has been cancelled.",
                contractId, ReferenceType.CONTRACT,
                "Contract cancelled",
                EmailTemplates.contractCancelled(
                        contract.getBid().getProject().getClient().getName(),
                        projectTitle, frontendUrl + "/client/contracts/" + contractId
                )
        );

        notificationService.notifyWithEmail(
                freelancerId, freeEmail,
                NotificationType.CONTRACT_CANCELLED,
                "Contract cancelled",
                "The contract for \"" + projectTitle + "\" has been cancelled.",
                contractId, ReferenceType.CONTRACT,
                "Contract cancelled",
                EmailTemplates.contractCancelled(
                        contract.getBid().getFreelancer().getName(),
                        projectTitle, frontendUrl + "/freelancer/contracts/" + contractId
                )
        );

        return toResponse(contract, statsFor(contractId));
    }

    @Transactional
    public ContractResponse disputeContract(String contractId, String userId) {
        Contract contract = findContractById(contractId);
        assertParty(contract, userId);

        if (contract.getStatus() != ContractStatus.ACTIVE) {
            throw new IllegalStateException("Only ACTIVE contracts can be disputed");
        }

        contract.setStatus(ContractStatus.DISPUTED);

        String projectTitle = contract.getBid().getProject().getTitle();
        String clientId     = contract.getBid().getProject().getClient().getId();
        String clientEmail  = contract.getBid().getProject().getClient().getEmail();
        String freelancerId = contract.getBid().getFreelancer().getId();
        String freeEmail    = contract.getBid().getFreelancer().getEmail();

        notificationService.notifyWithEmail(
                clientId, clientEmail,
                NotificationType.CONTRACT_DISPUTED,
                "Contract disputed",
                "The contract for \"" + projectTitle + "\" is now under dispute.",
                contractId, ReferenceType.CONTRACT,
                "Contract disputed",
                EmailTemplates.contractDisputed(
                        contract.getBid().getProject().getClient().getName(),
                        projectTitle, frontendUrl + "/client/contracts/" + contractId
                )
        );

        notificationService.notifyWithEmail(
                freelancerId, freeEmail,
                NotificationType.CONTRACT_DISPUTED,
                "Contract disputed",
                "The contract for \"" + projectTitle + "\" is now under dispute.",
                contractId, ReferenceType.CONTRACT,
                "Contract disputed",
                EmailTemplates.contractDisputed(
                        contract.getBid().getFreelancer().getName(),
                        projectTitle, frontendUrl + "/freelancer/contracts/" + contractId
                )
        );

        return toResponse(contract, statsFor(contractId));
    }

    // ─── Package-private helpers ───────────────────────────────────────────────

    public Contract findContractById(String id) {
        return contractRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Contract not found: " + id));
    }

    // ─── Private helpers ───────────────────────────────────────────────────────

    private ContractMilestoneStats statsFor(String contractId) {
        List<Milestone> milestones = milestoneRepository.findByContractId(contractId);
        return ContractMilestoneStats.from(milestones);
    }

    private void assertParty(Contract contract, String userId) {
        boolean isFreelancer = contract.getBid().getFreelancer().getId().equals(userId);
        boolean isClient     = contract.getBid().getProject().getClient().getId().equals(userId);
        if (!isFreelancer && !isClient) {
            throw new UnauthorizedException("You are not a party to this contract");
        }
    }

    private void assertClient(Contract contract, String clientId) {
        if (!contract.getBid().getProject().getClient().getId().equals(clientId)) {
            throw new UnauthorizedException("Only the client can perform this action");
        }
    }

    public ContractResponse toResponse(Contract c, ContractMilestoneStats stats) {
        Bid bid = c.getBid();
        return new ContractResponse(
                c.getId(),
                bid.getId(),
                bid.getProject().getId(),
                bid.getProject().getTitle(),
                bid.getFreelancer().getId(),
                bid.getFreelancer().getName(),
                bid.getProject().getClient().getId(),
                bid.getProject().getClient().getName(),
                c.getStatus(),
                c.getAgreedPrice(),
                c.getStartDate(),
                c.getEndDate(),
                c.getCreatedAt(),
                stats.totalMilestones(),
                stats.approvedCount(),
                stats.pendingReviewCount(),
                stats.totalAllocated(),
                stats.clientTotalReleased(),
                stats.freelancerTotalEarned()
        );
    }
}