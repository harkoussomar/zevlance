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
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/contracts/{id}/reviews")
    public ResponseEntity<ReviewResponse> createReview(
            @PathVariable String id,
            @Valid @RequestBody CreateReviewRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        ReviewResponse response = reviewService.createReview(id, request, currentUser.getId());

        URI location = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/v1/reviews/{reviewId}")
                .buildAndExpand(response.id())
                .toUri();

        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/freelancers/{id}/reviews")
    public ResponseEntity<List<ReviewResponse>> getFreelancerReviews(
            @PathVariable String id
    ) {
        return ResponseEntity.ok(reviewService.getFreelancerReviews(id));
    }

    @GetMapping("/clients/{id}/reviews")
    public ResponseEntity<List<ReviewResponse>> getClientReviews(
            @PathVariable String id
    ) {
        return ResponseEntity.ok(reviewService.getClientReviews(id));
    }
}