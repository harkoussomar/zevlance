// --- DisputeController.java ---
package com.freelancehub.freelancehub.dispute.controller;

import com.freelancehub.freelancehub.dispute.dto.*;
import com.freelancehub.freelancehub.dispute.service.DisputeService;
import com.freelancehub.freelancehub.user.domain.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/contracts/{contractId}/dispute")
@RequiredArgsConstructor
public class DisputeController {

    private final DisputeService disputeService;

    // 🔒 No role restriction: any authenticated user can view their dispute.
    // Service layer enforces that only contract parties / admins can access it.
    @GetMapping
    public ResponseEntity<DisputeDetailsResponse> getDisputeDetails(
            @PathVariable String contractId,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(disputeService.getDisputeDetails(contractId, currentUser.getId()));
    }

    @PostMapping("/messages")
    public ResponseEntity<DisputeMessageResponse> sendMessage(
            @PathVariable String contractId,
            @Valid @RequestBody ChatMessageRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(disputeService.sendMessage(contractId, currentUser.getId(), request));
    }

    @PostMapping("/evidence")
    public ResponseEntity<DisputeEvidenceResponse> addEvidence(
            @PathVariable String contractId,
            @Valid @RequestBody AddEvidenceRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(
                disputeService.addEvidence(contractId, currentUser.getId(), request)
        );
    }

    // 🔒 Only contract parties should be able to escalate — enforced in the service.
    // Admins are also allowed (edge case: admin pre-emptively escalates).
    @PutMapping("/escalate")
    public ResponseEntity<Void> escalateDispute(
            @PathVariable String contractId,
            @AuthenticationPrincipal User currentUser
    ) {
        disputeService.escalateToAdmin(contractId, currentUser.getId());
        return ResponseEntity.ok().build();
    }

    // 🔒 NEW: Resolve endpoint — restricted to ADMIN role only.
    // Previously the RESOLVED status existed in DisputeStatus but there was no
    // endpoint to reach it. Without @PreAuthorize here, any user who somehow
    // knew the URL could attempt to resolve a dispute.
    // Requires Spring Security's @EnableMethodSecurity on your security config.
    @PutMapping("/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> resolveDispute(
            @PathVariable String contractId,
            @Valid @RequestBody ResolveDisputeRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        disputeService.resolveDispute(contractId, currentUser.getId(), request);
        return ResponseEntity.ok().build();
    }
}