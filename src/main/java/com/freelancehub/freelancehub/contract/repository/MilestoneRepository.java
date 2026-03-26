package com.freelancehub.freelancehub.contract.repository;

import com.freelancehub.freelancehub.contract.domain.Milestone;
import com.freelancehub.freelancehub.contract.domain.MilestoneStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MilestoneRepository extends JpaRepository<Milestone, String> {

    List<Milestone> findByContractId(String contractId);

    // Used to auto-complete contract when all milestones approved
    boolean existsByContractIdAndStatusNot(String contractId, MilestoneStatus status);
}