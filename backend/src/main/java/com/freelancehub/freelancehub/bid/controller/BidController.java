package com.freelancehub.freelancehub.bid.controller;

import com.freelancehub.freelancehub.bid.dto.BidResponse;
import com.freelancehub.freelancehub.bid.dto.CreateBidRequest;
import com.freelancehub.freelancehub.bid.service.BidService;
import com.freelancehub.freelancehub.contract.dto.ContractResponse;
import com.freelancehub.freelancehub.user.domain.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class BidController {

    private final BidService bidService;

    // POST /api/v1/projects/{id}/bids  — FREELANCER
    @PostMapping("/projects/{id}/bids")
    public ResponseEntity<BidResponse> submitBid(
            @PathVariable String id,
            @Valid @RequestBody CreateBidRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.status(201)
                .body(bidService.submitBid(id, request, currentUser.getId()));
    }

    // GET /api/v1/projects/{id}/bids  — CLIENT owner
    @GetMapping("/projects/{id}/bids")
    public ResponseEntity<Page<BidResponse>> getProjectBids(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        return ResponseEntity.ok(bidService.getProjectBids(id, currentUser.getId(), pageable));
    }

    // GET /api/v1/bids/my  — FREELANCER
    @GetMapping("/bids/my")
    public ResponseEntity<Page<BidResponse>> getMyBids(
            @AuthenticationPrincipal User currentUser,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        return ResponseEntity.ok(bidService.getMyBids(currentUser.getId(), pageable));
    }

    // PUT /api/v1/bids/{id}/withdraw  — FREELANCER owner
    @PutMapping("/bids/{id}/withdraw")
    public ResponseEntity<BidResponse> withdrawBid(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(bidService.withdrawBid(id, currentUser.getId()));
    }

    // PUT /api/v1/bids/{id}/reject  — CLIENT owner
    @PutMapping("/bids/{id}/reject")
    public ResponseEntity<BidResponse> rejectBid(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(bidService.rejectBid(id, currentUser.getId()));
    }

    // PUT /api/v1/bids/{id}/accept  — CLIENT owner → creates contract
    @PutMapping("/bids/{id}/accept")
    public ResponseEntity<ContractResponse> acceptBid(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(bidService.acceptBid(id, currentUser.getId()));
    }
}