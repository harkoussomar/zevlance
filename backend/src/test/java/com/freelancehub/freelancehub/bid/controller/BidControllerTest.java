package com.freelancehub.freelancehub.bid.controller;

import com.freelancehub.freelancehub.bid.domain.BidStatus;
import com.freelancehub.freelancehub.bid.dto.BidResponse;
import com.freelancehub.freelancehub.bid.dto.BidSummaryResponse;
import com.freelancehub.freelancehub.bid.dto.CreateBidRequest;
import com.freelancehub.freelancehub.bid.service.BidService;
import com.freelancehub.freelancehub.contract.domain.ContractStatus;
import com.freelancehub.freelancehub.contract.dto.ContractResponse;
import com.freelancehub.freelancehub.exception.ConflictException;
import com.freelancehub.freelancehub.exception.UnauthorizedException;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.stream.Stream;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = BidController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = {JwtAuthFilter.class, InternalApiFilter.class}
        )
)
class BidControllerTest extends WebMvcControllerTest {

    private static final String VALID_BID_BODY = """
            {
              "proposedPrice": 500,
              "coverLetter": "This cover letter is intentionally long enough to satisfy validation.",
              "estimatedDays": 14
            }
            """;

    @Autowired
    private MockMvc mockMvc;

    @ParameterizedTest(name = "{0}")
    @MethodSource("bidEndpoints")
    void bidEndpoint_whenMissingInternalToken_returnsUnauthorized(String testName, BidEndpoint endpoint) throws Exception {
        perform(endpoint, endpoint.correctUser())
                .andExpect(status().isUnauthorized());
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("bidEndpoints")
    void bidEndpoint_whenMissingAuthenticationWithInternalToken_returnsUnauthorized(String testName, BidEndpoint endpoint) throws Exception {
        perform(endpoint, internalApi())
                .andExpect(status().isUnauthorized());
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("bidEndpoints")
    void bidEndpoint_whenAuthenticatedWrongRoleWithInternalToken_returnsForbidden(String testName, BidEndpoint endpoint) throws Exception {
        perform(endpoint, internalApi(), endpoint.wrongRoleUser())
                .andExpect(status().isForbidden());
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("bidEndpoints")
    void bidEndpoint_whenAuthenticatedCorrectRoleWithInternalToken_returnsSuccess(String testName, BidEndpoint endpoint) throws Exception {
        ResultActions result = perform(endpoint, internalApi(), endpoint.correctUser())
                .andExpect(status().is2xxSuccessful());

        if ("submitBid".equals(endpoint.name())) {
            result.andExpect(header().string("Location", "http://localhost/api/v1/bids/bid-1"));
        }
    }

    @Test
    void submitBid_whenMissingRequestBody_returnsBadRequest() throws Exception {
        perform(new BidEndpoint("submitBid", HttpMethod.POST, "/api/v1/projects/project-1/bids", null, freelancerUser(), clientUser()),
                internalApi(), freelancerUser())
                .andExpect(status().isBadRequest());
    }

    @Test
    void submitBid_whenInvalidRequestBody_returnsBadRequest() throws Exception {
        perform(new BidEndpoint("submitBid", HttpMethod.POST, "/api/v1/projects/project-1/bids",
                "{\"proposedPrice\":0,\"coverLetter\":\"too short\",\"estimatedDays\":0}", freelancerUser(), clientUser()),
                internalApi(), freelancerUser())
                .andExpect(status().isBadRequest());
    }

    @Test
    void submitBid_whenDuplicateBid_returnsConflict() throws Exception {
        perform(new BidEndpoint("submitBid", HttpMethod.POST, "/api/v1/projects/duplicate-project/bids",
                VALID_BID_BODY, freelancerUser(), clientUser()), internalApi(), freelancerUser())
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("You have already submitted a bid on this project"));
    }

    @Test
    void submitBid_whenProjectClosed_returnsBadRequest() throws Exception {
        perform(new BidEndpoint("submitBid", HttpMethod.POST, "/api/v1/projects/closed-project/bids",
                VALID_BID_BODY, freelancerUser(), clientUser()), internalApi(), freelancerUser())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Project is not open for bidding"));
    }

    @Test
    void getProjectBids_whenAuthenticatedForeignClient_returnsUnauthorized() throws Exception {
        perform(new BidEndpoint("getProjectBids", HttpMethod.GET, "/api/v1/projects/project-1/bids", null, clientUser(), freelancerUser()),
                internalApi(), foreignClientUser())
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("You do not own this project"));
    }

    @Test
    void withdrawBid_whenAuthenticatedForeignFreelancer_returnsUnauthorized() throws Exception {
        perform(new BidEndpoint("withdrawBid", HttpMethod.PUT, "/api/v1/bids/bid-1/withdraw", null, freelancerUser(), clientUser()),
                internalApi(), foreignFreelancerUser())
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("You do not own this bid"));
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("clientOwnedBidActionEndpoints")
    void clientBidAction_whenAuthenticatedForeignClient_returnsUnauthorized(String testName, BidEndpoint endpoint) throws Exception {
        perform(endpoint, internalApi(), foreignClientUser())
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("You do not own this project"));
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("pendingStateEndpoints")
    void bidStateTransition_whenBidIsNotPending_returnsBadRequest(String testName, BidEndpoint endpoint) throws Exception {
        perform(endpoint, internalApi(), endpoint.correctUser())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Only PENDING bids can be changed"));
    }

    private ResultActions perform(BidEndpoint endpoint, RequestPostProcessor... processors) throws Exception {
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

    private static Stream<Arguments> bidEndpoints() {
        return Stream.of(
                Arguments.of("submitBid", new BidEndpoint("submitBid", HttpMethod.POST,
                        "/api/v1/projects/project-1/bids", VALID_BID_BODY, freelancerUser(), clientUser())),
                Arguments.of("getProjectBids", new BidEndpoint("getProjectBids", HttpMethod.GET,
                        "/api/v1/projects/project-1/bids", null, clientUser(), freelancerUser())),
                Arguments.of("getMyBids", new BidEndpoint("getMyBids", HttpMethod.GET,
                        "/api/v1/bids/my?status=PENDING&page=0&size=10", null, freelancerUser(), clientUser())),
                Arguments.of("getMyBidsSummary", new BidEndpoint("getMyBidsSummary", HttpMethod.GET,
                        "/api/v1/bids/my/summary", null, freelancerUser(), clientUser())),
                Arguments.of("withdrawBid", new BidEndpoint("withdrawBid", HttpMethod.PUT,
                        "/api/v1/bids/bid-1/withdraw", null, freelancerUser(), clientUser())),
                Arguments.of("rejectBid", new BidEndpoint("rejectBid", HttpMethod.PUT,
                        "/api/v1/bids/bid-1/reject", null, clientUser(), freelancerUser())),
                Arguments.of("acceptBid", new BidEndpoint("acceptBid", HttpMethod.PUT,
                        "/api/v1/bids/bid-1/accept", null, clientUser(), freelancerUser()))
        );
    }

    private static Stream<Arguments> clientOwnedBidActionEndpoints() {
        return Stream.of(
                Arguments.of("rejectBid", new BidEndpoint("rejectBid", HttpMethod.PUT,
                        "/api/v1/bids/bid-1/reject", null, clientUser(), freelancerUser())),
                Arguments.of("acceptBid", new BidEndpoint("acceptBid", HttpMethod.PUT,
                        "/api/v1/bids/bid-1/accept", null, clientUser(), freelancerUser()))
        );
    }

    private static Stream<Arguments> pendingStateEndpoints() {
        return Stream.of(
                Arguments.of("withdrawBid", new BidEndpoint("withdrawBid", HttpMethod.PUT,
                        "/api/v1/bids/not-pending/withdraw", null, freelancerUser(), clientUser())),
                Arguments.of("rejectBid", new BidEndpoint("rejectBid", HttpMethod.PUT,
                        "/api/v1/bids/not-pending/reject", null, clientUser(), freelancerUser())),
                Arguments.of("acceptBid", new BidEndpoint("acceptBid", HttpMethod.PUT,
                        "/api/v1/bids/not-pending/accept", null, clientUser(), freelancerUser()))
        );
    }

    private static RequestPostProcessor foreignClientUser() {
        com.freelancehub.freelancehub.user.domain.Client client = new com.freelancehub.freelancehub.user.domain.Client();
        client.setId("client-2");
        client.setEmail("other-client@example.com");
        client.setName("Other Client");
        client.setPassword("{noop}password");
        client.setActive(true);
        client.setEmailVerified(true);
        return authenticatedUser(client);
    }

    private static RequestPostProcessor foreignFreelancerUser() {
        com.freelancehub.freelancehub.user.domain.Freelancer freelancer = new com.freelancehub.freelancehub.user.domain.Freelancer();
        freelancer.setId("freelancer-2");
        freelancer.setEmail("other-freelancer@example.com");
        freelancer.setName("Other Freelancer");
        freelancer.setPassword("{noop}password");
        freelancer.setActive(true);
        freelancer.setEmailVerified(true);
        return authenticatedUser(freelancer);
    }

    private record BidEndpoint(
            String name,
            HttpMethod method,
            String path,
            String body,
            RequestPostProcessor correctUser,
            RequestPostProcessor wrongRoleUser
    ) {}

    @TestConfiguration
    static class BidServiceTestConfig {

        @Bean
        StubBidService bidService() {
            return new StubBidService();
        }
    }

    public static class StubBidService extends BidService {

        public StubBidService() {
            super(null, null, null, null, null);
        }

        @Override
        public BidResponse submitBid(String projectId, CreateBidRequest request, String freelancerId) {
            if ("closed-project".equals(projectId)) {
                throw new IllegalStateException("Project is not open for bidding");
            }
            if ("duplicate-project".equals(projectId)) {
                throw new ConflictException("You have already submitted a bid on this project");
            }

            return bid("bid-1", projectId, freelancerId, BidStatus.PENDING);
        }

        @Override
        public Page<BidResponse> getProjectBids(String projectId, String clientId, Pageable pageable) {
            assertClientOwnsProject(clientId);
            return Page.empty();
        }

        @Override
        public Page<BidResponse> getMyBids(String freelancerId, BidStatus status, Pageable pageable) {
            assertFreelancer(freelancerId);
            return Page.empty();
        }

        @Override
        public BidSummaryResponse getMyBidsSummary(String freelancerId) {
            assertFreelancer(freelancerId);
            return new BidSummaryResponse(1, 0, 0, 0, 0, 0);
        }

        @Override
        public BidResponse withdrawBid(String bidId, String freelancerId) {
            assertFreelancerOwnsBid(freelancerId);
            assertPending(bidId);
            return bid(bidId, "project-1", freelancerId, BidStatus.WITHDRAWN);
        }

        @Override
        public BidResponse rejectBid(String bidId, String clientId) {
            assertClientOwnsProject(clientId);
            assertPending(bidId);
            return bid(bidId, "project-1", "freelancer-1", BidStatus.REJECTED);
        }

        @Override
        public ContractResponse acceptBid(String bidId, String clientId) {
            assertClientOwnsProject(clientId);
            assertPending(bidId);
            return contract();
        }

        private void assertClientOwnsProject(String clientId) {
            if (!"client-1".equals(clientId)) {
                throw new UnauthorizedException("You do not own this project");
            }
        }

        private void assertFreelancer(String freelancerId) {
            if (!"freelancer-1".equals(freelancerId)) {
                throw new UnauthorizedException("You do not own this bid");
            }
        }

        private void assertFreelancerOwnsBid(String freelancerId) {
            assertFreelancer(freelancerId);
        }

        private void assertPending(String bidId) {
            if ("not-pending".equals(bidId)) {
                throw new IllegalStateException("Only PENDING bids can be changed");
            }
        }

        private BidResponse bid(String bidId, String projectId, String freelancerId, BidStatus status) {
            return new BidResponse(
                    bidId,
                    projectId,
                    "Project One",
                    freelancerId,
                    "Freelancer User",
                    BigDecimal.valueOf(500),
                    "This cover letter is intentionally long enough to satisfy validation.",
                    14,
                    status,
                    LocalDateTime.now(),
                    null
            );
        }

        private ContractResponse contract() {
            return new ContractResponse(
                    "contract-1",
                    "bid-1",
                    "project-1",
                    "Project One",
                    "freelancer-1",
                    "Freelancer User",
                    "client-1",
                    "Client User",
                    ContractStatus.ACTIVE,
                    BigDecimal.valueOf(500),
                    LocalDate.now(),
                    LocalDate.now().plusDays(14),
                    LocalDateTime.now(),
                    0,
                    0,
                    0,
                    BigDecimal.ZERO,
                    BigDecimal.ZERO,
                    BigDecimal.ZERO
            );
        }
    }
}
