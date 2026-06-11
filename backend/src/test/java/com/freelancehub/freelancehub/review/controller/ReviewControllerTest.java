package com.freelancehub.freelancehub.review.controller;

import com.freelancehub.freelancehub.exception.ConflictException;
import com.freelancehub.freelancehub.exception.UnauthorizedException;
import com.freelancehub.freelancehub.review.dto.CreateReviewRequest;
import com.freelancehub.freelancehub.review.dto.ReviewResponse;
import com.freelancehub.freelancehub.review.service.ReviewService;
import com.freelancehub.freelancehub.security.InternalApiFilter;
import com.freelancehub.freelancehub.security.JwtAuthFilter;
import com.freelancehub.freelancehub.web.support.WebMvcControllerTest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Stream;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = ReviewController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = {JwtAuthFilter.class, InternalApiFilter.class}
        )
)
class ReviewControllerTest extends WebMvcControllerTest {

    private static final String VALID_REVIEW_BODY = """
            {
              "rating": 5,
              "comment": "Clear communication and solid delivery."
            }
            """;

    @Autowired
    private MockMvc mockMvc;

    @ParameterizedTest(name = "{0}")
    @MethodSource("reviewEndpoints")
    void reviewEndpoint_whenMissingInternalToken_returnsUnauthorized(String testName, ReviewEndpoint endpoint) throws Exception {
        perform(endpoint, endpoint.successUser())
                .andExpect(status().isUnauthorized());
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("publicReviewEndpoints")
    void publicReviewEndpoint_whenMissingAuthenticationWithInternalToken_returnsSuccess(String testName, ReviewEndpoint endpoint) throws Exception {
        perform(endpoint, internalApi())
                .andExpect(status().isOk());
    }

    @Test
    void createReview_whenMissingAuthenticationWithInternalToken_returnsUnauthorized() throws Exception {
        perform(createReviewEndpoint("contract-1", VALID_REVIEW_BODY), internalApi())
                .andExpect(status().isUnauthorized());
    }

    @Test
    void createReview_whenAuthenticatedClientParty_returnsCreated() throws Exception {
        perform(createReviewEndpoint("contract-1", VALID_REVIEW_BODY), internalApi(), clientUser())
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "http://localhost/api/v1/reviews/review-1"));
    }

    @Test
    void createReview_whenAuthenticatedFreelancerParty_returnsCreated() throws Exception {
        perform(createReviewEndpoint("contract-1", VALID_REVIEW_BODY), internalApi(), freelancerUser())
                .andExpect(status().isCreated());
    }

    @Test
    void createReview_whenAuthenticatedNonParty_returnsUnauthorized() throws Exception {
        perform(createReviewEndpoint("contract-1", VALID_REVIEW_BODY), internalApi(), adminUser())
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("You are not a party to this contract"));
    }

    @Test
    void createReview_whenMissingRequestBody_returnsBadRequest() throws Exception {
        perform(createReviewEndpoint("contract-1", null), internalApi(), clientUser())
                .andExpect(status().isBadRequest());
    }

    @Test
    void createReview_whenInvalidRequestBody_returnsBadRequest() throws Exception {
        perform(createReviewEndpoint("contract-1", "{\"rating\":0}"), internalApi(), clientUser())
                .andExpect(status().isBadRequest());
    }

    @Test
    void createReview_whenContractIsNotCompleted_returnsBadRequest() throws Exception {
        perform(createReviewEndpoint("active-contract", VALID_REVIEW_BODY), internalApi(), clientUser())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Reviews can only be left on COMPLETED contracts"));
    }

    @Test
    void createReview_whenReviewerAlreadyReviewedContract_returnsConflict() throws Exception {
        perform(createReviewEndpoint("duplicate-review", VALID_REVIEW_BODY), internalApi(), clientUser())
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("You have already reviewed this contract"));
    }

    private ResultActions perform(ReviewEndpoint endpoint, RequestPostProcessor... processors) throws Exception {
        MockHttpServletRequestBuilder request = request(endpoint.method(), endpoint.path())
                .accept(MediaType.APPLICATION_JSON);

        if (endpoint.body() != null) {
            request.contentType(MediaType.APPLICATION_JSON)
                    .content(endpoint.body());
        }

        for (RequestPostProcessor processor : processors) {
            request.with(processor);
        }

        return mockMvc.perform(request);
    }

    private static Stream<Arguments> reviewEndpoints() {
        return Stream.concat(Stream.of(Arguments.of("createReview", createReviewEndpoint("contract-1", VALID_REVIEW_BODY))),
                publicReviewEndpoints());
    }

    private static Stream<Arguments> publicReviewEndpoints() {
        return Stream.of(
                Arguments.of("getFreelancerReviews", new ReviewEndpoint("getFreelancerReviews", HttpMethod.GET,
                        "/api/v1/freelancers/freelancer-1/reviews", null, clientUser())),
                Arguments.of("getClientReviews", new ReviewEndpoint("getClientReviews", HttpMethod.GET,
                        "/api/v1/clients/client-1/reviews", null, clientUser()))
        );
    }

    private static ReviewEndpoint createReviewEndpoint(String contractId, String body) {
        return new ReviewEndpoint("createReview", HttpMethod.POST,
                "/api/v1/contracts/" + contractId + "/reviews", body, clientUser());
    }

    private record ReviewEndpoint(
            String name,
            HttpMethod method,
            String path,
            String body,
            RequestPostProcessor successUser
    ) {}

    @TestConfiguration
    static class ReviewServiceTestConfig {

        @Bean
        StubReviewService reviewService() {
            return new StubReviewService();
        }
    }

    public static class StubReviewService extends ReviewService {

        public StubReviewService() {
            super(null, null, null, null, null);
        }

        @Override
        public ReviewResponse createReview(String contractId, CreateReviewRequest request, String reviewerId) {
            if (!"client-1".equals(reviewerId) && !"freelancer-1".equals(reviewerId)) {
                throw new UnauthorizedException("You are not a party to this contract");
            }
            if ("active-contract".equals(contractId)) {
                throw new IllegalStateException("Reviews can only be left on COMPLETED contracts");
            }
            if ("duplicate-review".equals(contractId)) {
                throw new ConflictException("You have already reviewed this contract");
            }
            String revieweeId = "client-1".equals(reviewerId) ? "freelancer-1" : "client-1";
            return response("review-1", contractId, reviewerId, revieweeId);
        }

        @Override
        public List<ReviewResponse> getFreelancerReviews(String freelancerId) {
            return List.of(response("review-1", "contract-1", "client-1", freelancerId));
        }

        @Override
        public List<ReviewResponse> getClientReviews(String clientId) {
            return List.of(response("review-2", "contract-1", "freelancer-1", clientId));
        }

        private ReviewResponse response(String id, String contractId, String reviewerId, String revieweeId) {
            return new ReviewResponse(
                    id,
                    contractId,
                    reviewerId,
                    "Reviewer",
                    revieweeId,
                    "Reviewee",
                    5,
                    "Clear communication and solid delivery.",
                    LocalDateTime.now()
            );
        }
    }
}
