package com.freelancehub.freelancehub.bid.controller;

import com.freelancehub.freelancehub.bid.domain.BidStatus;
import com.freelancehub.freelancehub.bid.dto.BidResponse;
import com.freelancehub.freelancehub.bid.dto.BidSummaryResponse;
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
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class BidController {

    private final BidService bidService;

    @PostMapping("/projects/{id}/bids")
    public ResponseEntity<BidResponse> submitBid(
            @PathVariable String id,
            @Valid @RequestBody CreateBidRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        BidResponse response = bidService.submitBid(id, request, currentUser.getId());
        URI location = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/v1/bids/{bidId}")
                .buildAndExpand(response.id())
                .toUri();
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/projects/{id}/bids")
    public ResponseEntity<Page<BidResponse>> getProjectBids(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        return ResponseEntity.ok(bidService.getProjectBids(id, currentUser.getId(), pageable));
    }

    // ── my bids ───────────────────────────────────────────────────────────────

    /**
     * GET /api/v1/bids/my?status=PENDING&page=0&size=10
     * {@code status} is optional — omit to return all statuses.
     */
    @GetMapping("/bids/my")
    public ResponseEntity<Page<BidResponse>> getMyBids(
            @RequestParam(required = false) BidStatus status,
            @AuthenticationPrincipal User currentUser,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        return ResponseEntity.ok(bidService.getMyBids(currentUser.getId(), status, pageable));
    }

    /**
     * GET /api/v1/bids/my/summary
     * Lightweight aggregate: counts per status + totalValue + successRate.
     * Intentionally separate from the paginated list so the frontend can
     * display stat cards without depending on the current page's content.
     */
    @GetMapping("/bids/my/summary")
    public ResponseEntity<BidSummaryResponse> getMyBidsSummary(
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(bidService.getMyBidsSummary(currentUser.getId()));
    }

    // ── bid actions ───────────────────────────────────────────────────────────

    @PutMapping("/bids/{id}/withdraw")
    public ResponseEntity<BidResponse> withdrawBid(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(bidService.withdrawBid(id, currentUser.getId()));
    }

    @PutMapping("/bids/{id}/reject")
    public ResponseEntity<BidResponse> rejectBid(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(bidService.rejectBid(id, currentUser.getId()));
    }

    @PutMapping("/bids/{id}/accept")
    public ResponseEntity<ContractResponse> acceptBid(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(bidService.acceptBid(id, currentUser.getId()));
    }
}