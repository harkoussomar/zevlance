package com.freelancehub.freelancehub.contract.service;

import com.freelancehub.freelancehub.bid.domain.Bid;
import com.freelancehub.freelancehub.contract.domain.Contract;
import com.freelancehub.freelancehub.contract.domain.ContractStatus;
import com.freelancehub.freelancehub.contract.dto.ContractResponse;
import com.freelancehub.freelancehub.contract.repository.ContractRepository;
import com.freelancehub.freelancehub.exception.NotFoundException;
import com.freelancehub.freelancehub.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ContractService {

    private final ContractRepository contractRepository;

    // ── Called by BidService on bid acceptance ────────────────────

    @Transactional
    public ContractResponse createContract(Bid bid) {
        Contract contract = new Contract();
        contract.setAgreedPrice(bid.getProposedPrice());
        contract.setStartDate(LocalDate.now());
        contract.setStatus(ContractStatus.ACTIVE);
        contract.setBid(bid);

        contractRepository.save(contract);
        return toResponse(contract);
    }

    // ── Both parties: list their contracts ───────────────────────

    @Transactional(readOnly = true)
    public List<ContractResponse> getMyContracts(String userId) {
        return contractRepository.findAllByUserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ── Both parties: get single contract ────────────────────────

    @Transactional(readOnly = true)
    public ContractResponse getContract(String contractId, String userId) {
        Contract contract = findContractById(contractId);

        assertParty(contract, userId);
        return toResponse(contract);
    }

    // ── Client: complete contract ─────────────────────────────────

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
        return toResponse(contract);
    }

    // ── Both parties: cancel contract ────────────────────────────

    @Transactional
    public ContractResponse cancelContract(String contractId, String userId) {
        Contract contract = findContractById(contractId);

        assertParty(contract, userId);

        if (contract.getStatus() != ContractStatus.ACTIVE) {
            throw new IllegalStateException("Only ACTIVE contracts can be cancelled");
        }

        contract.setStatus(ContractStatus.CANCELLED);
        contract.setEndDate(LocalDate.now());
        return toResponse(contract);
    }

    // ── Both parties: dispute contract ───────────────────────────

    @Transactional
    public ContractResponse disputeContract(String contractId, String userId) {
        Contract contract = findContractById(contractId);

        assertParty(contract, userId);

        if (contract.getStatus() != ContractStatus.ACTIVE) {
            throw new IllegalStateException("Only ACTIVE contracts can be disputed");
        }

        contract.setStatus(ContractStatus.DISPUTED);
        return toResponse(contract);
    }

    // ── Internal — used by MilestoneService ──────────────────────

    public Contract findContractById(String id) {
        return contractRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Contract not found: " + id));
    }

    // ── Helpers ───────────────────────────────────────────────────

    private void assertParty(Contract contract, String userId) {
        boolean isFreelancer = contract.getBid().getFreelancer().getId().equals(userId);
        boolean isClient = contract.getBid().getProject().getClient().getId().equals(userId);
        if (!isFreelancer && !isClient) {
            throw new UnauthorizedException("You are not a party to this contract");
        }
    }

    private void assertClient(Contract contract, String clientId) {
        if (!contract.getBid().getProject().getClient().getId().equals(clientId)) {
            throw new UnauthorizedException("Only the client can perform this action");
        }
    }

    // ── Mapping ───────────────────────────────────────────────────

    public ContractResponse toResponse(Contract c) {
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
                c.getCreatedAt()
        );
    }
}