package com.freelancehub.freelancehub.contract.controller;

import com.freelancehub.freelancehub.contract.dto.ContractResponse;
import com.freelancehub.freelancehub.contract.service.ContractService;
import com.freelancehub.freelancehub.user.domain.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/contracts")
@RequiredArgsConstructor
public class ContractController {

    private final ContractService contractService;

    // GET /api/v1/contracts/my — both parties
    @GetMapping("/my")
    public ResponseEntity<List<ContractResponse>> getMyContracts(
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(contractService.getMyContracts(currentUser.getId()));
    }

    // GET /api/v1/contracts/{id} — both parties
    @GetMapping("/{id}")
    public ResponseEntity<ContractResponse> getContract(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(contractService.getContract(id, currentUser.getId()));
    }

    // PUT /api/v1/contracts/{id}/complete — CLIENT
    @PutMapping("/{id}/complete")
    public ResponseEntity<ContractResponse> completeContract(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(contractService.completeContract(id, currentUser.getId()));
    }

    // PUT /api/v1/contracts/{id}/cancel — both parties
    @PutMapping("/{id}/cancel")
    public ResponseEntity<ContractResponse> cancelContract(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(contractService.cancelContract(id, currentUser.getId()));
    }

    // PUT /api/v1/contracts/{id}/dispute — both parties
    @PutMapping("/{id}/dispute")
    public ResponseEntity<ContractResponse> disputeContract(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(contractService.disputeContract(id, currentUser.getId()));
    }
}