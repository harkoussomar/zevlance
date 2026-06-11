package com.freelancehub.freelancehub.dispute.repository;

import com.freelancehub.freelancehub.dispute.domain.Dispute;
import com.freelancehub.freelancehub.dispute.domain.DisputeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DisputeRepository extends JpaRepository<Dispute, String> {
    Optional<Dispute> findByContractId(String contractId);
    Page<Dispute> findAllByStatus(DisputeStatus status, Pageable pageable);
}
