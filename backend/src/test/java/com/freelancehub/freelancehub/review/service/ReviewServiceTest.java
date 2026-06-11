package com.freelancehub.freelancehub.review.service;

import com.freelancehub.freelancehub.bid.domain.Bid;
import com.freelancehub.freelancehub.contract.domain.Contract;
import com.freelancehub.freelancehub.contract.domain.ContractStatus;
import com.freelancehub.freelancehub.contract.service.ContractService;
import com.freelancehub.freelancehub.exception.ConflictException;
import com.freelancehub.freelancehub.exception.UnauthorizedException;
import com.freelancehub.freelancehub.project.domain.Project;
import com.freelancehub.freelancehub.review.domain.Review;
import com.freelancehub.freelancehub.review.dto.CreateReviewRequest;
import com.freelancehub.freelancehub.review.dto.ReviewResponse;
import com.freelancehub.freelancehub.review.repository.ReviewRepository;
import com.freelancehub.freelancehub.user.domain.Client;
import com.freelancehub.freelancehub.user.domain.Freelancer;
import com.freelancehub.freelancehub.user.repository.ClientRepository;
import com.freelancehub.freelancehub.user.repository.FreelancerRepository;
import com.freelancehub.freelancehub.user.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private ContractService contractService;

    @Mock
    private UserService userService;

    @Mock
    private FreelancerRepository freelancerRepository;

    @Mock
    private ClientRepository clientRepository;

    private ReviewService reviewService;

    @BeforeEach
    void setUp() {
        reviewService = new ReviewService(
                reviewRepository,
                contractService,
                userService,
                freelancerRepository,
                clientRepository
        );
    }

    @Test
    void createReview_whenClientReviewsCompletedContract_savesReviewForFreelancerAndUpdatesRating() {
        Contract contract = contract("contract-1", ContractStatus.COMPLETED);
        Client reviewer = contract.getClient();
        Freelancer reviewee = contract.getFreelancer();
        when(contractService.findContractById("contract-1")).thenReturn(contract);
        when(userService.findById("client-1")).thenReturn(reviewer);
        when(userService.findById("freelancer-1")).thenReturn(reviewee);
        doAnswer(invocation -> {
            Review review = invocation.getArgument(0);
            review.setId("review-1");
            return review;
        }).when(reviewRepository).saveAndFlush(any(Review.class));
        when(reviewRepository.calculateAverageRating("freelancer-1")).thenReturn(4.26);

        ReviewResponse response = reviewService.createReview(
                "contract-1",
                new CreateReviewRequest(5, "Clear communication and solid delivery."),
                "client-1"
        );

        ArgumentCaptor<Review> captor = ArgumentCaptor.forClass(Review.class);
        verify(reviewRepository).saveAndFlush(captor.capture());
        Review saved = captor.getValue();
        assertThat(saved.getContract()).isSameAs(contract);
        assertThat(saved.getReviewer()).isSameAs(reviewer);
        assertThat(saved.getReviewee()).isSameAs(reviewee);
        assertThat(saved.getRating()).isEqualTo(5);
        assertThat(saved.getComment()).isEqualTo("Clear communication and solid delivery.");
        assertThat(reviewee.getRating()).isEqualTo(4.3);
        assertThat(response.id()).isEqualTo("review-1");
        assertThat(response.reviewerId()).isEqualTo("client-1");
        assertThat(response.revieweeId()).isEqualTo("freelancer-1");
    }

    @Test
    void createReview_whenFreelancerReviewsCompletedContract_savesReviewForClientAndUpdatesRating() {
        Contract contract = contract("contract-1", ContractStatus.COMPLETED);
        Freelancer reviewer = contract.getFreelancer();
        Client reviewee = contract.getClient();
        when(contractService.findContractById("contract-1")).thenReturn(contract);
        when(userService.findById("freelancer-1")).thenReturn(reviewer);
        when(userService.findById("client-1")).thenReturn(reviewee);
        doAnswer(invocation -> {
            Review review = invocation.getArgument(0);
            review.setId("review-1");
            return review;
        }).when(reviewRepository).saveAndFlush(any(Review.class));
        when(reviewRepository.calculateAverageRating("client-1")).thenReturn(3.24);

        ReviewResponse response = reviewService.createReview(
                "contract-1",
                new CreateReviewRequest(3, "Requirements changed frequently."),
                "freelancer-1"
        );

        assertThat(reviewee.getRating()).isEqualTo(3.2);
        assertThat(response.reviewerId()).isEqualTo("freelancer-1");
        assertThat(response.revieweeId()).isEqualTo("client-1");
    }

    @Test
    void createReview_whenContractIsNotCompleted_throwsIllegalState() {
        when(contractService.findContractById("contract-1")).thenReturn(contract("contract-1", ContractStatus.ACTIVE));

        assertThatThrownBy(() -> reviewService.createReview(
                "contract-1",
                new CreateReviewRequest(5, "Great work."),
                "client-1"
        ))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Reviews can only be left on COMPLETED contracts");

        verifyNoInteractions(userService, reviewRepository);
    }

    @Test
    void createReview_whenReviewerIsNotContractParty_throwsUnauthorized() {
        Client reviewer = client("client-2");
        when(contractService.findContractById("contract-1")).thenReturn(contract("contract-1", ContractStatus.COMPLETED));
        when(userService.findById("client-2")).thenReturn(reviewer);

        assertThatThrownBy(() -> reviewService.createReview(
                "contract-1",
                new CreateReviewRequest(5, "Great work."),
                "client-2"
        ))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("You are not a party to this contract");

        verify(reviewRepository, never()).saveAndFlush(any());
    }

    @Test
    void createReview_whenReviewerAlreadyReviewedContract_throwsConflictWithoutUpdatingRating() {
        Contract contract = contract("contract-1", ContractStatus.COMPLETED);
        Freelancer reviewee = contract.getFreelancer();
        when(contractService.findContractById("contract-1")).thenReturn(contract);
        when(userService.findById("client-1")).thenReturn(contract.getClient());
        when(userService.findById("freelancer-1")).thenReturn(reviewee);
        when(reviewRepository.saveAndFlush(any(Review.class)))
                .thenThrow(new DataIntegrityViolationException("duplicate"));

        assertThatThrownBy(() -> reviewService.createReview(
                "contract-1",
                new CreateReviewRequest(5, "Great work."),
                "client-1"
        ))
                .isInstanceOf(ConflictException.class)
                .hasMessage("You have already reviewed this contract");

        verify(reviewRepository, never()).calculateAverageRating(any());
        assertThat(reviewee.getRating()).isZero();
    }

    @Test
    void createReview_whenAverageRatingIsNull_leavesExistingRatingUnchanged() {
        Contract contract = contract("contract-1", ContractStatus.COMPLETED);
        Freelancer reviewee = contract.getFreelancer();
        reviewee.setRating(4.0);
        when(contractService.findContractById("contract-1")).thenReturn(contract);
        when(userService.findById("client-1")).thenReturn(contract.getClient());
        when(userService.findById("freelancer-1")).thenReturn(reviewee);
        doAnswer(invocation -> {
            Review review = invocation.getArgument(0);
            review.setId("review-1");
            return review;
        }).when(reviewRepository).saveAndFlush(any(Review.class));
        when(reviewRepository.calculateAverageRating("freelancer-1")).thenReturn(null);

        reviewService.createReview("contract-1", new CreateReviewRequest(5, "Great work."), "client-1");

        assertThat(reviewee.getRating()).isEqualTo(4.0);
    }

    @Test
    void getFreelancerReviews_returnsReviewsForFreelancer() {
        Contract contract = contract("contract-1", ContractStatus.COMPLETED);
        Review review = review("review-1", contract, contract.getClient(), contract.getFreelancer(), 5);
        when(reviewRepository.findByRevieweeId("freelancer-1")).thenReturn(List.of(review));

        List<ReviewResponse> responses = reviewService.getFreelancerReviews("freelancer-1");

        assertThat(responses).hasSize(1);
        assertThat(responses.getFirst().id()).isEqualTo("review-1");
        assertThat(responses.getFirst().revieweeId()).isEqualTo("freelancer-1");
        assertThat(responses.getFirst().rating()).isEqualTo(5);
    }

    @Test
    void getClientReviews_returnsReviewsForClient() {
        Contract contract = contract("contract-1", ContractStatus.COMPLETED);
        Review review = review("review-1", contract, contract.getFreelancer(), contract.getClient(), 4);
        when(reviewRepository.findByRevieweeId("client-1")).thenReturn(List.of(review));

        List<ReviewResponse> responses = reviewService.getClientReviews("client-1");

        assertThat(responses).hasSize(1);
        assertThat(responses.getFirst().revieweeId()).isEqualTo("client-1");
        assertThat(responses.getFirst().reviewerId()).isEqualTo("freelancer-1");
        assertThat(responses.getFirst().rating()).isEqualTo(4);
    }

    @Test
    void createReview_doesNotUseUserTypeRepositoriesForRatingUpdates() {
        Contract contract = contract("contract-1", ContractStatus.COMPLETED);
        when(contractService.findContractById("contract-1")).thenReturn(contract);
        when(userService.findById("client-1")).thenReturn(contract.getClient());
        when(userService.findById("freelancer-1")).thenReturn(contract.getFreelancer());
        doAnswer(invocation -> {
            Review review = invocation.getArgument(0);
            review.setId("review-1");
            return review;
        }).when(reviewRepository).saveAndFlush(any(Review.class));
        when(reviewRepository.calculateAverageRating("freelancer-1")).thenReturn(5.0);

        reviewService.createReview("contract-1", new CreateReviewRequest(5, "Great work."), "client-1");

        verifyNoInteractions(freelancerRepository, clientRepository);
    }

    private Contract contract(String id, ContractStatus status) {
        Client client = client("client-1");
        Freelancer freelancer = freelancer("freelancer-1");

        Project project = new Project();
        project.setId("project-1");
        project.setTitle("Project One");
        project.setClient(client);

        Bid bid = new Bid();
        bid.setId("bid-1");
        bid.setProject(project);
        bid.setFreelancer(freelancer);

        Contract contract = new Contract();
        contract.setId(id);
        contract.setBid(bid);
        contract.setClient(client);
        contract.setFreelancer(freelancer);
        contract.setStatus(status);
        return contract;
    }

    private Review review(String id, Contract contract, com.freelancehub.freelancehub.user.domain.User reviewer,
                          com.freelancehub.freelancehub.user.domain.User reviewee, int rating) {
        Review review = new Review();
        review.setId(id);
        review.setContract(contract);
        review.setReviewer(reviewer);
        review.setReviewee(reviewee);
        review.setRating(rating);
        review.setComment("Clear communication and solid delivery.");
        return review;
    }

    private Client client(String id) {
        Client client = new Client();
        client.setId(id);
        client.setName("Client User");
        client.setEmail(id + "@example.com");
        return client;
    }

    private Freelancer freelancer(String id) {
        Freelancer freelancer = new Freelancer();
        freelancer.setId(id);
        freelancer.setName("Freelancer User");
        freelancer.setEmail(id + "@example.com");
        return freelancer;
    }
}
