package com.freelancehub.freelancehub.contract.controller;

import com.freelancehub.freelancehub.contract.dto.CreateMilestoneRequest;
import com.freelancehub.freelancehub.contract.dto.MilestoneResponse;
import com.freelancehub.freelancehub.contract.dto.SubmitDeliverableRequest;
import com.freelancehub.freelancehub.contract.service.MilestoneService;
import com.freelancehub.freelancehub.user.domain.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class MilestoneController {

    private final MilestoneService milestoneService;

    // POST /api/v1/contracts/{id}/milestones — CLIENT
    @PostMapping("/contracts/{id}/milestones")
    public ResponseEntity<MilestoneResponse> createMilestone(
            @PathVariable String id,
            @Valid @RequestBody CreateMilestoneRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.status(201)
                .body(milestoneService.createMilestone(id, request, currentUser.getId()));
    }

    // GET /api/v1/contracts/{id}/milestones — both parties
    @GetMapping("/contracts/{id}/milestones")
    public ResponseEntity<List<MilestoneResponse>> getMilestones(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(milestoneService.getMilestones(id, currentUser.getId()));
    }

    // PUT /api/v1/milestones/{id}/submit — FREELANCER
    @PutMapping("/milestones/{id}/submit")
    public ResponseEntity<MilestoneResponse> submitDeliverable(
            @PathVariable String id,
            @Valid @RequestBody SubmitDeliverableRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(
                milestoneService.submitDeliverable(id, request, currentUser.getId())
        );
    }

    // PUT /api/v1/milestones/{id}/approve — CLIENT
    @PutMapping("/milestones/{id}/approve")
    public ResponseEntity<MilestoneResponse> approveMilestone(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(milestoneService.approveMilestone(id, currentUser.getId()));
    }

    // PUT /api/v1/milestones/{id}/revision — CLIENT
    @PutMapping("/milestones/{id}/revision")
    public ResponseEntity<MilestoneResponse> requestRevision(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(milestoneService.requestRevision(id, currentUser.getId()));
    }
}