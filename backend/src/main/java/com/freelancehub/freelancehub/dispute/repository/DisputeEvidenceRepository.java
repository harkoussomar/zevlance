package com.freelancehub.freelancehub.dispute.repository;

import com.freelancehub.freelancehub.dispute.domain.DisputeEvidence;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DisputeEvidenceRepository extends JpaRepository<DisputeEvidence, String> {
    List<DisputeEvidence> findByDisputeIdOrderByCreatedAtDesc(String disputeId);
}