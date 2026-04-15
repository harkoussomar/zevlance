package com.freelancehub.freelancehub.review.service;

import com.freelancehub.freelancehub.contract.domain.Contract;
import com.freelancehub.freelancehub.contract.domain.ContractStatus;
import com.freelancehub.freelancehub.contract.service.ContractService;
import com.freelancehub.freelancehub.exception.ConflictException;
import com.freelancehub.freelancehub.exception.UnauthorizedException;
import com.freelancehub.freelancehub.review.domain.Review;
import com.freelancehub.freelancehub.review.dto.CreateReviewRequest;
import com.freelancehub.freelancehub.review.dto.ReviewResponse;
import com.freelancehub.freelancehub.review.repository.ReviewRepository;
import com.freelancehub.freelancehub.user.domain.Client;
import com.freelancehub.freelancehub.user.domain.Freelancer;
import com.freelancehub.freelancehub.user.domain.User;
import com.freelancehub.freelancehub.user.repository.ClientRepository;
import com.freelancehub.freelancehub.user.repository.FreelancerRepository;
import com.freelancehub.freelancehub.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ContractService contractService;
    private final UserService userService;
    private final FreelancerRepository freelancerRepository;
    private final ClientRepository clientRepository;

    @Transactional
    public ReviewResponse createReview(String contractId, CreateReviewRequest request, String reviewerId) {
        Contract contract = contractService.findContractById(contractId);

        if (contract.getStatus() != ContractStatus.COMPLETED) {
            throw new IllegalStateException("Reviews can only be left on COMPLETED contracts");
        }

        User reviewer = userService.findById(reviewerId);
        User reviewee = resolveReviewee(contract, reviewerId);

        Review review = new Review();
        review.setContract(contract);
        review.setReviewer(reviewer);
        review.setReviewee(reviewee);
        review.setRating(request.rating());
        review.setComment(request.comment());

        try {
            reviewRepository.saveAndFlush(review);
        } catch (DataIntegrityViolationException e) {
            throw new ConflictException("You have already reviewed this contract");
        }

        updateRating(reviewee);
        return toResponse(review);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getFreelancerReviews(String freelancerId) {
        return reviewRepository.findByRevieweeId(freelancerId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getClientReviews(String clientId) {
        return reviewRepository.findByRevieweeId(clientId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private User resolveReviewee(Contract contract, String reviewerId) {
        String freelancerId = contract.getBid().getFreelancer().getId();
        String clientId = contract.getBid().getProject().getClient().getId();

        if (reviewerId.equals(freelancerId)) {
            return userService.findById(clientId);
        } else if (reviewerId.equals(clientId)) {
            return userService.findById(freelancerId);
        } else {
            throw new UnauthorizedException("You are not a party to this contract");
        }
    }

    private void updateRating(User reviewee) {
        Double avg = reviewRepository.calculateAverageRating(reviewee.getId());
        if (avg == null) return;

        double rounded = Math.round(avg * 10.0) / 10.0;

        if (reviewee instanceof Freelancer freelancer) {
            freelancer.setRating(rounded);
        } else if (reviewee instanceof Client client) {
            client.setRating(rounded);
        }
    }

    private ReviewResponse toResponse(Review r) {
        return new ReviewResponse(
                r.getId(),
                r.getContract().getId(),
                r.getReviewer().getId(),
                r.getReviewer().getName(),
                r.getReviewee().getId(),
                r.getReviewee().getName(),
                r.getRating(),
                r.getComment(),
                r.getCreatedAt()
        );
    }
}