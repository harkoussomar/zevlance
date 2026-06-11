package com.freelancehub.freelancehub.contract.controller;

import com.freelancehub.freelancehub.contract.domain.ContractStatus;
import com.freelancehub.freelancehub.contract.dto.ContractResponse;
import com.freelancehub.freelancehub.contract.dto.ContractSummaryResponse;
import com.freelancehub.freelancehub.contract.service.ContractService;
import com.freelancehub.freelancehub.user.domain.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/contracts")
@RequiredArgsConstructor
public class ContractController {

    private final ContractService contractService;

    // ─── GET /api/v1/contracts/my/summary ─────────────────────────────────────
    // Must be declared BEFORE /my to avoid Spring matching "summary" as {id}.
    @GetMapping("/my/summary")
    public ResponseEntity<ContractSummaryResponse> getMyContractsSummary(
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(contractService.getMyContractsSummary(currentUser.getId()));
    }

    // ─── GET /api/v1/contracts/my?status=ACTIVE&page=0&size=10 ────────────────
    @GetMapping("/my")
    public ResponseEntity<Page<ContractResponse>> getMyContracts(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(required = false) ContractStatus status,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(contractService.getMyContracts(currentUser.getId(), status, pageable));
    }

    // ─── GET /api/v1/contracts/{id} ───────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<ContractResponse> getContract(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(contractService.getContract(id, currentUser.getId()));
    }

    // ─── PUT /api/v1/contracts/{id}/complete — CLIENT ─────────────────────────
    @PutMapping("/{id}/complete")
    public ResponseEntity<ContractResponse> completeContract(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(contractService.completeContract(id, currentUser.getId()));
    }

    // ─── PUT /api/v1/contracts/{id}/cancel — both parties ────────────────────
    @PutMapping("/{id}/cancel")
    public ResponseEntity<ContractResponse> cancelContract(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(contractService.cancelContract(id, currentUser.getId()));
    }

// ─── PUT /api/v1/contracts/{id}/dispute — both parties ───────────────────
    @PutMapping("/{id}/dispute")
    public ResponseEntity<ContractResponse> disputeContract(
            @PathVariable String id,
            @Valid @RequestBody com.freelancehub.freelancehub.dispute.dto.OpenDisputeRequest request, // ✅ ADDED THIS
            @AuthenticationPrincipal User currentUser
    ) {
        // ✅ PASS THE REQUEST TO THE SERVICE
        return ResponseEntity.ok(contractService.disputeContract(id, currentUser.getId(), request));
    }
}