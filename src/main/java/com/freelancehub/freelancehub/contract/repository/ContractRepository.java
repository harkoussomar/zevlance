package com.freelancehub.freelancehub.contract.repository;

import com.freelancehub.freelancehub.contract.domain.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ContractRepository extends JpaRepository<Contract, String> {

    // Both parties can see their contracts
    @Query("""
        SELECT c FROM Contract c
        WHERE c.bid.freelancer.id = :userId
           OR c.bid.project.client.id = :userId
        """)
    List<Contract> findAllByUserId(@Param("userId") String userId);
}