package com.freelancehub.freelancehub.contract.controller;

import com.freelancehub.freelancehub.contract.domain.MilestoneStatus;
import com.freelancehub.freelancehub.contract.dto.CreateMilestoneRequest;
import com.freelancehub.freelancehub.contract.dto.MilestoneResponse;
import com.freelancehub.freelancehub.contract.dto.SubmitDeliverableRequest;
import com.freelancehub.freelancehub.contract.service.MilestoneService;
import com.freelancehub.freelancehub.payment.domain.RefundStatus;
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
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Stream;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = MilestoneController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = {JwtAuthFilter.class, InternalApiFilter.class}
        )
)
class MilestoneControllerTest extends WebMvcControllerTest {

    private static final String VALID_CREATE_BODY = """
            {
              "title": "First delivery",
              "description": "Initial project milestone",
              "amount": 500,
              "dueDate": "2030-01-01"
            }
            """;

    private static final String VALID_SUBMIT_BODY = """
            {
              "deliverableUrl": "https://deliverables.test/ms-1"
            }
            """;

    @Autowired
    private MockMvc mockMvc;

    @ParameterizedTest(name = "{0}")
    @MethodSource("milestoneEndpoints")
    void milestoneEndpoint_whenMissingInternalToken_returnsUnauthorized(String testName, MilestoneEndpoint endpoint) throws Exception {
        perform(endpoint, endpoint.correctUser())
                .andExpect(status().isUnauthorized());
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("milestoneEndpoints")
    void milestoneEndpoint_whenMissingAuthenticationWithInternalToken_returnsUnauthorized(String testName, MilestoneEndpoint endpoint) throws Exception {
        perform(endpoint, internalApi())
                .andExpect(status().isUnauthorized());
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("roleEnforcedMilestoneEndpoints")
    void milestoneEndpoint_whenAuthenticatedWrongRoleWithInternalToken_returnsForbidden(String testName, MilestoneEndpoint endpoint) throws Exception {
        perform(endpoint, internalApi(), endpoint.wrongRoleUser())
                .andExpect(status().isForbidden());
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("milestoneEndpoints")
    void milestoneEndpoint_whenAuthenticatedCorrectRoleWithInternalToken_returnsSuccess(String testName, MilestoneEndpoint endpoint) throws Exception {
        ResultActions result = perform(endpoint, internalApi(), endpoint.correctUser())
                .andExpect(status().is2xxSuccessful());

        if ("createMilestone".equals(endpoint.name())) {
            result.andExpect(header().string("Location", "http://localhost/api/v1/milestones/ms-1"));
        }
    }

    @Test
    void getMilestones_whenAuthenticatedFreelancerParty_returnsSuccess() throws Exception {
        perform(new MilestoneEndpoint("getMilestones", HttpMethod.GET, "/api/v1/contracts/contract-1/milestones",
                null, freelancerUser(), adminUser()), internalApi(), freelancerUser())
                .andExpect(status().isOk());
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("partyEnforcedMilestoneEndpoints")
    void milestoneEndpoint_whenAuthenticatedNonParty_returnsUnauthorized(String testName, MilestoneEndpoint endpoint) throws Exception {
        perform(endpoint, internalApi(), endpoint.nonPartyUser())
                .andExpect(status().isUnauthorized());
    }

    @Test
    void createMilestone_whenMissingRequestBody_returnsBadRequest() throws Exception {
        perform(new MilestoneEndpoint("createMilestone", HttpMethod.POST, "/api/v1/contracts/contract-1/milestones",
                null, clientUser(), freelancerUser()), internalApi(), clientUser())
                .andExpect(status().isBadRequest());
    }

    @Test
    void createMilestone_whenInvalidRequestBody_returnsBadRequest() throws Exception {
        perform(new MilestoneEndpoint("createMilestone", HttpMethod.POST, "/api/v1/contracts/contract-1/milestones",
                "{\"title\":\"\",\"amount\":0,\"dueDate\":\"2000-01-01\"}", clientUser(), freelancerUser()),
                internalApi(), clientUser())
                .andExpect(status().isBadRequest());
    }

    @Test
    void createMilestone_whenContractIsNotActive_returnsBadRequest() throws Exception {
        perform(new MilestoneEndpoint("createMilestone", HttpMethod.POST, "/api/v1/contracts/inactive-contract/milestones",
                VALID_CREATE_BODY, clientUser(), freelancerUser()), internalApi(), clientUser())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Milestones can only be added to ACTIVE contracts"));
    }

    @Test
    void createMilestone_whenAmountBelowStripeMinimum_returnsBadRequest() throws Exception {
        perform(new MilestoneEndpoint("createMilestone", HttpMethod.POST, "/api/v1/contracts/contract-1/milestones",
                VALID_CREATE_BODY.replace("\"amount\": 500", "\"amount\": 4"), clientUser(), freelancerUser()),
                internalApi(), clientUser())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Milestone amount must be at least $5.00."));
    }

    @Test
    void submitDeliverable_whenMissingRequestBody_returnsBadRequest() throws Exception {
        perform(new MilestoneEndpoint("submitDeliverable", HttpMethod.PUT, "/api/v1/milestones/ms-1/submit",
                null, freelancerUser(), clientUser()), internalApi(), freelancerUser())
                .andExpect(status().isBadRequest());
    }

    @Test
    void submitDeliverable_whenInvalidRequestBody_returnsBadRequest() throws Exception {
        perform(new MilestoneEndpoint("submitDeliverable", HttpMethod.PUT, "/api/v1/milestones/ms-1/submit",
                "{\"deliverableUrl\":\"\"}", freelancerUser(), clientUser()), internalApi(), freelancerUser())
                .andExpect(status().isBadRequest());
    }

    @Test
    void submitDeliverable_whenMilestoneStatusCannotBeSubmitted_returnsBadRequest() throws Exception {
        perform(new MilestoneEndpoint("submitDeliverable", HttpMethod.PUT, "/api/v1/milestones/not-funded/submit",
                VALID_SUBMIT_BODY, freelancerUser(), clientUser()), internalApi(), freelancerUser())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Deliverable can only be submitted when milestone is FUNDED or REVISION_REQUESTED. Current status: PENDING"));
    }

    @Test
    void approveMilestone_whenMilestoneIsNotSubmitted_returnsBadRequest() throws Exception {
        perform(new MilestoneEndpoint("approveMilestone", HttpMethod.PUT, "/api/v1/milestones/not-submitted/approve",
                null, clientUser(), freelancerUser()), internalApi(), clientUser())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Only SUBMITTED milestones can be approved"));
    }

    @Test
    void requestRevision_whenMilestoneIsNotSubmitted_returnsBadRequest() throws Exception {
        perform(new MilestoneEndpoint("requestRevision", HttpMethod.PUT, "/api/v1/milestones/not-submitted/revision",
                null, clientUser(), freelancerUser()), internalApi(), clientUser())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Revision can only be requested on SUBMITTED milestones"));
    }

    @Test
    void milestoneRefundStateRoute_whenMilestoneIsNotFunded_returnsBadRequest() throws Exception {
        perform(new MilestoneEndpoint("milestoneRefundStateRoute", HttpMethod.PUT, "/api/v1/milestones/not-funded/refund",
                null, clientUser(), freelancerUser()), internalApi(), clientUser())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Only FUNDED milestones can be directly refunded. Use Dispute for submitted milestones."));
    }

    @Test
    void milestoneRefundStateRoute_whenDeliverableAlreadySubmitted_returnsBadRequest() throws Exception {
        perform(new MilestoneEndpoint("milestoneRefundStateRoute", HttpMethod.PUT, "/api/v1/milestones/submitted-work/refund",
                null, clientUser(), freelancerUser()), internalApi(), clientUser())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Cannot refund milestone after work has been submitted."));
    }

    private ResultActions perform(MilestoneEndpoint endpoint, RequestPostProcessor... processors) throws Exception {
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

    private static Stream<Arguments> milestoneEndpoints() {
        return Stream.of(
                Arguments.of("createMilestone", new MilestoneEndpoint("createMilestone", HttpMethod.POST,
                        "/api/v1/contracts/contract-1/milestones", VALID_CREATE_BODY, clientUser(), freelancerUser())),
                Arguments.of("getMilestones", new MilestoneEndpoint("getMilestones", HttpMethod.GET,
                        "/api/v1/contracts/contract-1/milestones", null, clientUser(), adminUser())),
                Arguments.of("submitDeliverable", new MilestoneEndpoint("submitDeliverable", HttpMethod.PUT,
                        "/api/v1/milestones/ms-1/submit", VALID_SUBMIT_BODY, freelancerUser(), clientUser())),
                Arguments.of("approveMilestone", new MilestoneEndpoint("approveMilestone", HttpMethod.PUT,
                        "/api/v1/milestones/ms-1/approve", null, clientUser(), freelancerUser())),
                Arguments.of("requestRevision", new MilestoneEndpoint("requestRevision", HttpMethod.PUT,
                        "/api/v1/milestones/ms-1/revision", null, clientUser(), freelancerUser())),
                Arguments.of("milestoneRefundStateRoute", new MilestoneEndpoint("milestoneRefundStateRoute", HttpMethod.PUT,
                        "/api/v1/milestones/ms-1/refund", null, clientUser(), freelancerUser()))
        );
    }

    private static Stream<Arguments> roleEnforcedMilestoneEndpoints() {
        return milestoneEndpoints()
                .filter(arguments -> !"getMilestones".equals(((MilestoneEndpoint) arguments.get()[1]).name()));
    }

    private static Stream<Arguments> partyEnforcedMilestoneEndpoints() {
        return milestoneEndpoints();
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

    private record MilestoneEndpoint(
            String name,
            HttpMethod method,
            String path,
            String body,
            RequestPostProcessor correctUser,
            RequestPostProcessor wrongRoleUser
    ) {
        RequestPostProcessor nonPartyUser() {
            return "submitDeliverable".equals(name) ? foreignFreelancerUser() : foreignClientUser();
        }
    }

    @TestConfiguration
    static class MilestoneServiceTestConfig {

        @Bean
        StubMilestoneService milestoneService() {
            return new StubMilestoneService();
        }
    }

    public static class StubMilestoneService extends MilestoneService {

        public StubMilestoneService() {
            super(null, null, null, null);
        }

        @Override
        public MilestoneResponse createMilestone(String contractId, CreateMilestoneRequest request, String clientId) {
            assertClient(clientId);
            if ("inactive-contract".equals(contractId)) {
                throw new IllegalStateException("Milestones can only be added to ACTIVE contracts");
            }
            if (request.amount().compareTo(BigDecimal.valueOf(5)) < 0) {
                throw new IllegalArgumentException("Milestone amount must be at least $5.00.");
            }
            return response("ms-1", contractId, MilestoneStatus.PENDING, null, 0);
        }

        @Override
        public List<MilestoneResponse> getMilestones(String contractId, String userId) {
            assertParty(userId);
            return List.of(response("ms-1", contractId, MilestoneStatus.FUNDED, null, 0));
        }

        @Override
        public MilestoneResponse submitDeliverable(String milestoneId, SubmitDeliverableRequest request, String freelancerId) {
            assertFreelancer(freelancerId);
            if ("not-funded".equals(milestoneId)) {
                throw new IllegalStateException("Deliverable can only be submitted when milestone is FUNDED or REVISION_REQUESTED. Current status: PENDING");
            }
            return response(milestoneId, "contract-1", MilestoneStatus.SUBMITTED, request.deliverableUrl(), 0);
        }

        @Override
        public MilestoneResponse approveMilestone(String milestoneId, String clientId) {
            assertClient(clientId);
            if ("not-submitted".equals(milestoneId)) {
                throw new IllegalStateException("Only SUBMITTED milestones can be approved");
            }
            return response(milestoneId, "contract-1", MilestoneStatus.APPROVED, null, 0);
        }

        @Override
        public MilestoneResponse requestRevision(String milestoneId, String clientId) {
            assertClient(clientId);
            if ("not-submitted".equals(milestoneId)) {
                throw new IllegalStateException("Revision can only be requested on SUBMITTED milestones");
            }
            return response(milestoneId, "contract-1", MilestoneStatus.REVISION_REQUESTED, null, 1);
        }

        @Override
        public MilestoneResponse refundMilestone(String milestoneId, String clientId) {
            assertClient(clientId);
            if ("not-funded".equals(milestoneId)) {
                throw new IllegalStateException("Only FUNDED milestones can be directly refunded. Use Dispute for submitted milestones.");
            }
            if ("submitted-work".equals(milestoneId)) {
                throw new IllegalStateException("Cannot refund milestone after work has been submitted.");
            }
            return response(milestoneId, "contract-1", MilestoneStatus.REFUNDED, null, 0);
        }

        private void assertClient(String userId) {
            if (!"client-1".equals(userId)) {
                throw new UnauthorizedException("Only the client can perform this action");
            }
        }

        private void assertFreelancer(String userId) {
            if (!"freelancer-1".equals(userId)) {
                throw new UnauthorizedException("Only the freelancer can perform this action");
            }
        }

        private void assertParty(String userId) {
            if (!"client-1".equals(userId) && !"freelancer-1".equals(userId)) {
                throw new UnauthorizedException("You are not a party to this contract");
            }
        }

        private MilestoneResponse response(
                String id,
                String contractId,
                MilestoneStatus status,
                String deliverableUrl,
                int revisionCount
        ) {
            return new MilestoneResponse(
                    id,
                    contractId,
                    "First delivery",
                    "Initial project milestone",
                    BigDecimal.valueOf(500),
                    status,
                    LocalDate.now().plusDays(30),
                    deliverableUrl,
                    BigDecimal.valueOf(50),
                    BigDecimal.valueOf(450),
                    LocalDateTime.now(),
                    status == MilestoneStatus.APPROVED ? LocalDateTime.now() : null,
                    revisionCount,
                    status == MilestoneStatus.REFUNDED ? RefundStatus.SUCCEEDED : RefundStatus.NONE
            );
        }
    }
}
