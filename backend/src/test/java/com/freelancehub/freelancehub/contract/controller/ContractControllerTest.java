package com.freelancehub.freelancehub.contract.controller;

import com.freelancehub.freelancehub.contract.domain.ContractStatus;
import com.freelancehub.freelancehub.contract.dto.ContractResponse;
import com.freelancehub.freelancehub.contract.dto.ContractSummaryResponse;
import com.freelancehub.freelancehub.contract.service.ContractService;
import com.freelancehub.freelancehub.dispute.dto.OpenDisputeRequest;
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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = ContractController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = {JwtAuthFilter.class, InternalApiFilter.class}
        )
)
class ContractControllerTest extends WebMvcControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @ParameterizedTest(name = "{0}")
    @MethodSource("contractEndpoints")
    void contractEndpoint_whenMissingInternalToken_returnsUnauthorized(String testName, ContractEndpoint endpoint) throws Exception {
        perform(endpoint, clientUser())
                .andExpect(status().isUnauthorized());
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("contractEndpoints")
    void contractEndpoint_whenMissingAuthenticationWithInternalToken_returnsUnauthorized(String testName, ContractEndpoint endpoint) throws Exception {
        perform(endpoint, internalApi())
                .andExpect(status().isUnauthorized());
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("contractEndpoints")
    void contractEndpoint_whenAuthenticatedNonPartyWithInternalToken_returnsUnauthorized(String testName, ContractEndpoint endpoint) throws Exception {
        perform(endpoint, internalApi(), foreignClientUser())
                .andExpect(status().isUnauthorized());
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("contractEndpoints")
    void contractEndpoint_whenAuthenticatedContractPartyWithInternalToken_returnsSuccess(String testName, ContractEndpoint endpoint) throws Exception {
        perform(endpoint, internalApi(), endpoint.successUser())
                .andExpect(status().is2xxSuccessful());
    }

    @Test
    void completeContract_whenAuthenticatedFreelancer_returnsForbidden() throws Exception {
        perform(new ContractEndpoint("completeContract", HttpMethod.PUT, "/api/v1/contracts/contract-1/complete", null, clientUser()),
                internalApi(), freelancerUser())
                .andExpect(status().isForbidden());
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("stateTransitionEndpoints")
    void contractStateTransition_whenContractIsNotActive_returnsBadRequest(String testName, ContractEndpoint endpoint) throws Exception {
        perform(endpoint, internalApi(), endpoint.successUser())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Only ACTIVE contracts can be changed"));
    }

    @Test
    void disputeContract_whenMissingRequestBody_returnsBadRequest() throws Exception {
        perform(new ContractEndpoint("disputeContract", HttpMethod.PUT, "/api/v1/contracts/contract-1/dispute", null, freelancerUser()),
                internalApi(), freelancerUser())
                .andExpect(status().isBadRequest());
    }

    @Test
    void disputeContract_whenInvalidRequestBody_returnsBadRequest() throws Exception {
        perform(new ContractEndpoint("disputeContract", HttpMethod.PUT, "/api/v1/contracts/contract-1/dispute",
                "{\"reason\":\"\"}", freelancerUser()), internalApi(), freelancerUser())
                .andExpect(status().isBadRequest());
    }

    @Test
    void getContract_whenAuthenticatedForeignClient_returnsUnauthorized() throws Exception {
        perform(new ContractEndpoint("getContract", HttpMethod.GET, "/api/v1/contracts/contract-1", null, clientUser()),
                internalApi(), authenticatedUser(client("client-2", "other-client@example.com", "Other Client")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("You are not a party to this contract"));
    }

    private ResultActions perform(ContractEndpoint endpoint, RequestPostProcessor... processors) throws Exception {
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

    private static com.freelancehub.freelancehub.user.domain.Client client(String id, String email, String name) {
        com.freelancehub.freelancehub.user.domain.Client client = new com.freelancehub.freelancehub.user.domain.Client();
        client.setId(id);
        client.setEmail(email);
        client.setName(name);
        client.setPassword("{noop}password");
        client.setActive(true);
        client.setEmailVerified(true);
        return client;
    }

    private static RequestPostProcessor foreignClientUser() {
        return authenticatedUser(client("client-2", "other-client@example.com", "Other Client"));
    }

    private static Stream<Arguments> contractEndpoints() {
        return Stream.of(
                Arguments.of("getMyContractsSummary", new ContractEndpoint("getMyContractsSummary", HttpMethod.GET,
                        "/api/v1/contracts/my/summary", null, clientUser())),
                Arguments.of("getMyContracts", new ContractEndpoint("getMyContracts", HttpMethod.GET,
                        "/api/v1/contracts/my?status=ACTIVE&page=0&size=10", null, freelancerUser())),
                Arguments.of("getContract", new ContractEndpoint("getContract", HttpMethod.GET,
                        "/api/v1/contracts/contract-1", null, clientUser())),
                Arguments.of("completeContract", new ContractEndpoint("completeContract", HttpMethod.PUT,
                        "/api/v1/contracts/contract-1/complete", null, clientUser())),
                Arguments.of("cancelContract", new ContractEndpoint("cancelContract", HttpMethod.PUT,
                        "/api/v1/contracts/contract-1/cancel", null, freelancerUser())),
                Arguments.of("disputeContract", new ContractEndpoint("disputeContract", HttpMethod.PUT,
                        "/api/v1/contracts/contract-1/dispute", "{\"reason\":\"scope disagreement\"}", freelancerUser()))
        );
    }

    private static Stream<Arguments> stateTransitionEndpoints() {
        return Stream.of(
                Arguments.of("completeContract", new ContractEndpoint("completeContract", HttpMethod.PUT,
                        "/api/v1/contracts/inactive-contract/complete", null, clientUser())),
                Arguments.of("cancelContract", new ContractEndpoint("cancelContract", HttpMethod.PUT,
                        "/api/v1/contracts/inactive-contract/cancel", null, freelancerUser())),
                Arguments.of("disputeContract", new ContractEndpoint("disputeContract", HttpMethod.PUT,
                        "/api/v1/contracts/inactive-contract/dispute", "{\"reason\":\"scope disagreement\"}", freelancerUser()))
        );
    }

    private record ContractEndpoint(
            String name,
            HttpMethod method,
            String path,
            String body,
            RequestPostProcessor successUser
    ) {}

    @TestConfiguration
    static class ContractServiceTestConfig {

        @Bean
        StubContractService contractService() {
            return new StubContractService();
        }
    }

    public static class StubContractService extends ContractService {

        public StubContractService() {
            super(null, null, null, null, null);
        }

        @Override
        public ContractSummaryResponse getMyContractsSummary(String userId) {
            assertPartyUser(userId);
            return new ContractSummaryResponse(1, 1, 0, 0, 0, BigDecimal.valueOf(1000), BigDecimal.ZERO, BigDecimal.ZERO);
        }

        @Override
        public Page<ContractResponse> getMyContracts(String userId, ContractStatus status, Pageable pageable) {
            assertPartyUser(userId);
            return Page.empty();
        }

        @Override
        public ContractResponse getContract(String contractId, String userId) {
            assertPartyUser(userId);
            return response(contractId, ContractStatus.ACTIVE);
        }

        @Override
        public ContractResponse completeContract(String contractId, String clientId) {
            assertClient(clientId);
            assertActive(contractId);
            return response(contractId, ContractStatus.COMPLETED);
        }

        @Override
        public ContractResponse cancelContract(String contractId, String userId) {
            assertPartyUser(userId);
            assertActive(contractId);
            return response(contractId, ContractStatus.CANCELLED);
        }

        @Override
        public ContractResponse disputeContract(String contractId, String userId, OpenDisputeRequest request) {
            assertPartyUser(userId);
            assertActive(contractId);
            return response(contractId, ContractStatus.DISPUTED);
        }

        private void assertPartyUser(String userId) {
            if (!"client-1".equals(userId) && !"freelancer-1".equals(userId)) {
                throw new UnauthorizedException("You are not a party to this contract");
            }
        }

        private void assertClient(String userId) {
            if (!"client-1".equals(userId)) {
                throw new UnauthorizedException("Only the client can perform this action");
            }
        }

        private void assertActive(String contractId) {
            if ("inactive-contract".equals(contractId)) {
                throw new IllegalStateException("Only ACTIVE contracts can be changed");
            }
        }

        private ContractResponse response(String contractId, ContractStatus status) {
            return new ContractResponse(
                    contractId,
                    "bid-1",
                    "project-1",
                    "Project One",
                    "freelancer-1",
                    "Freelancer User",
                    "client-1",
                    "Client User",
                    status,
                    BigDecimal.valueOf(1000),
                    LocalDate.now(),
                    LocalDate.now().plusDays(30),
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
