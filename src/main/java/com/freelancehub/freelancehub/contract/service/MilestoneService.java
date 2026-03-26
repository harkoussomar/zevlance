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
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MilestoneService {

    private final MilestoneRepository milestoneRepository;
    private final ContractService contractService;

    // ── Client: create milestone ──────────────────────────────────

    @PreAuthorize("hasRole('CLIENT')")
    @Transactional
    public MilestoneResponse createMilestone(
            String contractId,
            CreateMilestoneRequest request,
            String clientId
    ) {
        Contract contract = contractService.findContractById(contractId);
        assertClient(contract, clientId);

        if (contract.getStatus() != ContractStatus.ACTIVE) {
            throw new IllegalStateException("Milestones can only be added to ACTIVE contracts");
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

    // ── Both parties: list milestones ─────────────────────────────

    @Transactional(readOnly = true)
    public List<MilestoneResponse> getMilestones(String contractId, String userId) {
        Contract contract = contractService.findContractById(contractId);
        assertParty(contract, userId);

        return milestoneRepository.findByContractId(contractId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ── Freelancer: submit deliverable ────────────────────────────

    @PreAuthorize("hasRole('FREELANCER')")
    @Transactional
    public MilestoneResponse submitDeliverable(
            String milestoneId,
            SubmitDeliverableRequest request,
            String freelancerId
    ) {
        Milestone milestone = findMilestoneById(milestoneId);
        assertFreelancer(milestone, freelancerId);

        if (milestone.getStatus() != MilestoneStatus.PENDING
                && milestone.getStatus() != MilestoneStatus.REVISION_REQUESTED) {
            throw new IllegalStateException(
                    "Deliverable can only be submitted when PENDING or REVISION_REQUESTED"
            );
        }

        milestone.setDeliverableUrl(request.deliverableUrl());
        milestone.setStatus(MilestoneStatus.SUBMITTED);
        return toResponse(milestone);
    }

    // ── Client: approve milestone ─────────────────────────────────

    @PreAuthorize("hasRole('CLIENT')")
    @Transactional
    public MilestoneResponse approveMilestone(String milestoneId, String clientId) {
        Milestone milestone = findMilestoneById(milestoneId);
        assertClient(milestone, clientId);

        if (milestone.getStatus() != MilestoneStatus.SUBMITTED) {
            throw new IllegalStateException("Only SUBMITTED milestones can be approved");
        }

        milestone.setStatus(MilestoneStatus.APPROVED);

        // Auto-complete contract if all milestones are approved
        autoCompleteContractIfDone(milestone.getContract(), clientId);

        return toResponse(milestone);
    }

    // ── Client: request revision ──────────────────────────────────

    @PreAuthorize("hasRole('CLIENT')")
    @Transactional
    public MilestoneResponse requestRevision(String milestoneId, String clientId) {
        Milestone milestone = findMilestoneById(milestoneId);
        assertClient(milestone, clientId);

        if (milestone.getStatus() != MilestoneStatus.SUBMITTED) {
            throw new IllegalStateException(
                    "Revision can only be requested on SUBMITTED milestones"
            );
        }

        milestone.setStatus(MilestoneStatus.REVISION_REQUESTED);
        return toResponse(milestone);
    }

    // ── Auto-complete contract ────────────────────────────────────
    //
    //  Called after every milestone approval.
    //  If no milestone exists with a status other than APPROVED
    //  → all milestones are done → contract auto-completes.

    private void autoCompleteContractIfDone(Contract contract, String clientId) {
        boolean anyNotApproved = milestoneRepository
                .existsByContractIdAndStatusNot(contract.getId(), MilestoneStatus.APPROVED);

        if (!anyNotApproved) {
            contractService.completeContract(contract.getId(), clientId);
        }
    }

    // ── Helpers ───────────────────────────────────────────────────

    private Milestone findMilestoneById(String id) {
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

    // ── Mapping ───────────────────────────────────────────────────

    private MilestoneResponse toResponse(Milestone m) {
        return new MilestoneResponse(
                m.getId(),
                m.getContract().getId(),
                m.getTitle(),
                m.getDescription(),
                m.getAmount(),
                m.getStatus(),
                m.getDueDate(),
                m.getDeliverableUrl()
        );
    }
}