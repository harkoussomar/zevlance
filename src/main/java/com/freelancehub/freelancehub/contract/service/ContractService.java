package com.freelancehub.freelancehub.contract.service;

import com.freelancehub.freelancehub.bid.domain.Bid;
import com.freelancehub.freelancehub.contract.domain.Contract;
import com.freelancehub.freelancehub.contract.domain.ContractStatus;
import com.freelancehub.freelancehub.contract.dto.ContractResponse;
import com.freelancehub.freelancehub.contract.repository.ContractRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class ContractService {

    private final ContractRepository contractRepository;

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

    private ContractResponse toResponse(Contract c) {
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