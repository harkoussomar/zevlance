package com.freelancehub.freelancehub.review.controller;

import com.freelancehub.freelancehub.review.dto.CreateReviewRequest;
import com.freelancehub.freelancehub.review.dto.ReviewResponse;
import com.freelancehub.freelancehub.review.service.ReviewService;
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
public class ReviewController {

    private final ReviewService reviewService;

    // POST /api/v1/contracts/{id}/reviews — both parties, once each
    @PostMapping("/contracts/{id}/reviews")
    public ResponseEntity<ReviewResponse> createReview(
            @PathVariable String id,
            @Valid @RequestBody CreateReviewRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.status(201)
                .body(reviewService.createReview(id, request, currentUser.getId()));
    }

    // GET /api/v1/freelancers/{id}/reviews — public
    @GetMapping("/freelancers/{id}/reviews")
    public ResponseEntity<List<ReviewResponse>> getFreelancerReviews(
            @PathVariable String id
    ) {
        return ResponseEntity.ok(reviewService.getFreelancerReviews(id));
    }

    // GET /api/v1/clients/{id}/reviews — public
    @GetMapping("/clients/{id}/reviews")
    public ResponseEntity<List<ReviewResponse>> getClientReviews(
            @PathVariable String id
    ) {
        return ResponseEntity.ok(reviewService.getClientReviews(id));
    }
}