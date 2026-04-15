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
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class MilestoneController {

    private final MilestoneService milestoneService;

    @PostMapping("/contracts/{id}/milestones")
    public ResponseEntity<MilestoneResponse> createMilestone(
            @PathVariable String id,
            @Valid @RequestBody CreateMilestoneRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        MilestoneResponse response = milestoneService.createMilestone(id, request, currentUser.getId());

        URI location = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/v1/milestones/{milestoneId}")
                .buildAndExpand(response.id())
                .toUri();

        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/contracts/{id}/milestones")
    public ResponseEntity<List<MilestoneResponse>> getMilestones(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(milestoneService.getMilestones(id, currentUser.getId()));
    }

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

    @PutMapping("/milestones/{id}/approve")
    public ResponseEntity<MilestoneResponse> approveMilestone(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(milestoneService.approveMilestone(id, currentUser.getId()));
    }

    @PutMapping("/milestones/{id}/revision")
    public ResponseEntity<MilestoneResponse> requestRevision(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(milestoneService.requestRevision(id, currentUser.getId()));
    }
}