package com.freelancehub.freelancehub.dispute.repository;

import com.freelancehub.freelancehub.dispute.domain.DisputeMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DisputeMessageRepository extends JpaRepository<DisputeMessage, String> {
    List<DisputeMessage> findByDisputeIdOrderByCreatedAtAsc(String disputeId);
}