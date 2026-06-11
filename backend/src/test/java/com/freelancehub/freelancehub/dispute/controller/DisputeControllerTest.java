package com.freelancehub.freelancehub.dispute.controller;

import com.freelancehub.freelancehub.dispute.domain.DisputeStatus;
import com.freelancehub.freelancehub.dispute.dto.AddEvidenceRequest;
import com.freelancehub.freelancehub.dispute.dto.ChatMessageRequest;
import com.freelancehub.freelancehub.dispute.dto.DisputeDetailsResponse;
import com.freelancehub.freelancehub.dispute.dto.DisputeEvidenceResponse;
import com.freelancehub.freelancehub.dispute.dto.DisputeMessageResponse;
import com.freelancehub.freelancehub.dispute.dto.ResolveDisputeRequest;
import com.freelancehub.freelancehub.dispute.service.DisputeService;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Stream;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = DisputeController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = {JwtAuthFilter.class, InternalApiFilter.class}
        )
)
class DisputeControllerTest extends WebMvcControllerTest {

    private static final String VALID_MESSAGE_BODY = """
            {
              "message": "The latest delivery does not match the contract scope."
            }
            """;

    private static final String VALID_EVIDENCE_BODY = """
            {
              "publicId": "disputes/contract-1/evidence-1",
              "secureUrl": "https://res.cloudinary.test/evidence-1.pdf",
              "fileName": "evidence-1.pdf",
              "description": "Signed statement of work"
            }
            """;

    private static final String VALID_RESOLVE_BODY = """
            {
              "outcome": "CLIENT_WINS",
              "explanation": "Refund the client because the submitted evidence supports the claim."
            }
            """;

    @Autowired
    private MockMvc mockMvc;

    @ParameterizedTest(name = "{0}")
    @MethodSource("disputeEndpoints")
    void disputeEndpoint_whenMissingInternalToken_returnsUnauthorized(String testName, DisputeEndpoint endpoint) throws Exception {
        perform(endpoint, endpoint.successUser())
                .andExpect(status().isUnauthorized());
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("disputeEndpoints")
    void disputeEndpoint_whenMissingAuthenticationWithInternalToken_returnsUnauthorized(String testName, DisputeEndpoint endpoint) throws Exception {
        perform(endpoint, internalApi())
                .andExpect(status().isUnauthorized());
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("partyOrAdminDisputeEndpoints")
    void disputeEndpoint_whenAuthenticatedNonParty_returnsUnauthorized(String testName, DisputeEndpoint endpoint) throws Exception {
        perform(endpoint, internalApi(), foreignClientUser())
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("You are not authorized to access this dispute"));
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("partyOrAdminDisputeEndpoints")
    void disputeEndpoint_whenAuthenticatedClientParty_returnsSuccess(String testName, DisputeEndpoint endpoint) throws Exception {
        perform(endpoint, internalApi(), clientUser())
                .andExpect(status().is2xxSuccessful());
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("partyOrAdminDisputeEndpoints")
    void disputeEndpoint_whenAuthenticatedFreelancerParty_returnsSuccess(String testName, DisputeEndpoint endpoint) throws Exception {
        perform(endpoint, internalApi(), freelancerUser())
                .andExpect(status().is2xxSuccessful());
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("partyOrAdminDisputeEndpoints")
    void disputeEndpoint_whenAuthenticatedAdmin_returnsSuccess(String testName, DisputeEndpoint endpoint) throws Exception {
        perform(endpoint, internalApi(), adminUser())
                .andExpect(status().is2xxSuccessful());
    }

    @Test
    void resolveDispute_whenAuthenticatedClient_returnsForbidden() throws Exception {
        perform(resolveEndpoint("contract-1", VALID_RESOLVE_BODY), internalApi(), clientUser())
                .andExpect(status().isForbidden());
    }

    @Test
    void resolveDispute_whenAuthenticatedAdmin_returnsSuccess() throws Exception {
        perform(resolveEndpoint("contract-1", VALID_RESOLVE_BODY), internalApi(), adminUser())
                .andExpect(status().isOk());
    }

    @Test
    void sendMessage_whenMissingRequestBody_returnsBadRequest() throws Exception {
        perform(new DisputeEndpoint("sendMessage", HttpMethod.POST, "/api/v1/contracts/contract-1/dispute/messages",
                null, clientUser()), internalApi(), clientUser())
                .andExpect(status().isBadRequest());
    }

    @Test
    void sendMessage_whenInvalidRequestBody_returnsBadRequest() throws Exception {
        perform(new DisputeEndpoint("sendMessage", HttpMethod.POST, "/api/v1/contracts/contract-1/dispute/messages",
                "{\"message\":\"\"}", clientUser()), internalApi(), clientUser())
                .andExpect(status().isBadRequest());
    }

    @Test
    void addEvidence_whenMissingRequestBody_returnsBadRequest() throws Exception {
        perform(new DisputeEndpoint("addEvidence", HttpMethod.POST, "/api/v1/contracts/contract-1/dispute/evidence",
                null, clientUser()), internalApi(), clientUser())
                .andExpect(status().isBadRequest());
    }

    @Test
    void addEvidence_whenInvalidRequestBody_returnsBadRequest() throws Exception {
        perform(new DisputeEndpoint("addEvidence", HttpMethod.POST, "/api/v1/contracts/contract-1/dispute/evidence",
                "{\"publicId\":\"\",\"secureUrl\":\"\",\"fileName\":\"\"}", clientUser()), internalApi(), clientUser())
                .andExpect(status().isBadRequest());
    }

    @Test
    void resolveDispute_whenMissingRequestBody_returnsBadRequest() throws Exception {
        perform(resolveEndpoint("contract-1", null), internalApi(), adminUser())
                .andExpect(status().isBadRequest());
    }

    @Test
    void resolveDispute_whenInvalidRequestBody_returnsBadRequest() throws Exception {
        perform(resolveEndpoint("contract-1", "{\"outcome\":\"CLIENT_WINS\",\"explanation\":\"short\"}"), internalApi(), adminUser())
                .andExpect(status().isBadRequest());
    }

    @Test
    void sendMessage_whenDisputeAlreadyResolved_returnsBadRequest() throws Exception {
        perform(new DisputeEndpoint("sendMessage", HttpMethod.POST, "/api/v1/contracts/resolved-contract/dispute/messages",
                VALID_MESSAGE_BODY, clientUser()), internalApi(), clientUser())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Dispute is already resolved and read-only."));
    }

    @Test
    void addEvidence_whenDisputeAlreadyResolved_returnsBadRequest() throws Exception {
        perform(new DisputeEndpoint("addEvidence", HttpMethod.POST, "/api/v1/contracts/resolved-contract/dispute/evidence",
                VALID_EVIDENCE_BODY, clientUser()), internalApi(), clientUser())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Dispute is already resolved and read-only."));
    }

    @Test
    void escalateDispute_whenDisputeAlreadyEscalated_returnsBadRequest() throws Exception {
        perform(new DisputeEndpoint("escalateDispute", HttpMethod.PUT, "/api/v1/contracts/escalated-contract/dispute/escalate",
                null, clientUser()), internalApi(), clientUser())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("This dispute has already been escalated to an admin."));
    }

    @Test
    void resolveDispute_whenDisputeAlreadyResolved_returnsBadRequest() throws Exception {
        perform(resolveEndpoint("resolved-contract", VALID_RESOLVE_BODY), internalApi(), adminUser())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("This dispute is already resolved."));
    }

    private ResultActions perform(DisputeEndpoint endpoint, RequestPostProcessor... processors) throws Exception {
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

    private static Stream<Arguments> disputeEndpoints() {
        return Stream.concat(partyOrAdminDisputeEndpoints(), Stream.of(
                Arguments.of("resolveDispute", resolveEndpoint("contract-1", VALID_RESOLVE_BODY))
        ));
    }

    private static Stream<Arguments> partyOrAdminDisputeEndpoints() {
        return Stream.of(
                Arguments.of("getDisputeDetails", new DisputeEndpoint("getDisputeDetails", HttpMethod.GET,
                        "/api/v1/contracts/contract-1/dispute", null, clientUser())),
                Arguments.of("sendMessage", new DisputeEndpoint("sendMessage", HttpMethod.POST,
                        "/api/v1/contracts/contract-1/dispute/messages", VALID_MESSAGE_BODY, clientUser())),
                Arguments.of("addEvidence", new DisputeEndpoint("addEvidence", HttpMethod.POST,
                        "/api/v1/contracts/contract-1/dispute/evidence", VALID_EVIDENCE_BODY, clientUser())),
                Arguments.of("escalateDispute", new DisputeEndpoint("escalateDispute", HttpMethod.PUT,
                        "/api/v1/contracts/contract-1/dispute/escalate", null, clientUser()))
        );
    }

    private static DisputeEndpoint resolveEndpoint(String contractId, String body) {
        return new DisputeEndpoint("resolveDispute", HttpMethod.PUT,
                "/api/v1/contracts/" + contractId + "/dispute/resolve", body, adminUser());
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

    private record DisputeEndpoint(
            String name,
            HttpMethod method,
            String path,
            String body,
            RequestPostProcessor successUser
    ) {}

    @TestConfiguration
    static class DisputeServiceTestConfig {

        @Bean
        StubDisputeService disputeService() {
            return new StubDisputeService();
        }
    }

    public static class StubDisputeService extends DisputeService {

        public StubDisputeService() {
            super(null, null, null, null, null, null, null, null);
        }

        @Override
        public DisputeDetailsResponse getDisputeDetails(String contractId, String userId) {
            assertPartyOrAdmin(userId);
            return details(contractId, statusFor(contractId));
        }

        @Override
        public DisputeMessageResponse sendMessage(String contractId, String userId, ChatMessageRequest request) {
            assertPartyOrAdmin(userId);
            assertActive(contractId);
            return new DisputeMessageResponse("msg-1", userId, "Sender", "CLIENT",
                    request.message(), false, LocalDateTime.now());
        }

        @Override
        public DisputeEvidenceResponse addEvidence(String contractId, String userId, AddEvidenceRequest request) {
            assertPartyOrAdmin(userId);
            assertActive(contractId);
            return new DisputeEvidenceResponse("evidence-1", userId, "Uploader",
                    request.secureUrl(), request.fileName(), request.description(), LocalDateTime.now());
        }

        @Override
        public void escalateToAdmin(String contractId, String userId) {
            assertPartyOrAdmin(userId);
            assertActive(contractId);
            if ("escalated-contract".equals(contractId)) {
                throw new IllegalStateException("This dispute has already been escalated to an admin.");
            }
        }

        @Override
        public void resolveDispute(String contractId, String adminId, ResolveDisputeRequest request) {
            if (!"admin-1".equals(adminId)) {
                throw new UnauthorizedException("Only admins can resolve disputes");
            }
            if ("resolved-contract".equals(contractId)) {
                throw new IllegalStateException("This dispute is already resolved.");
            }
        }

        private void assertPartyOrAdmin(String userId) {
            if (!"client-1".equals(userId) && !"freelancer-1".equals(userId) && !"admin-1".equals(userId)) {
                throw new UnauthorizedException("You are not authorized to access this dispute");
            }
        }

        private void assertActive(String contractId) {
            if ("resolved-contract".equals(contractId)) {
                throw new IllegalStateException("Dispute is already resolved and read-only.");
            }
        }

        private DisputeStatus statusFor(String contractId) {
            if ("resolved-contract".equals(contractId)) {
                return DisputeStatus.RESOLVED;
            }
            if ("escalated-contract".equals(contractId)) {
                return DisputeStatus.ESCALATED;
            }
            return DisputeStatus.OPEN;
        }

        private DisputeDetailsResponse details(String contractId, DisputeStatus status) {
            return new DisputeDetailsResponse(
                    "dispute-1",
                    contractId,
                    "client-1",
                    "Scope disagreement",
                    status,
                    LocalDateTime.now(),
                    List.of(new DisputeMessageResponse("msg-1", null, "System", "SYSTEM",
                            "Dispute opened", true, LocalDateTime.now())),
                    List.of()
            );
        }
    }
}
