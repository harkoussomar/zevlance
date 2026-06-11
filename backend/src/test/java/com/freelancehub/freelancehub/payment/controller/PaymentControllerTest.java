package com.freelancehub.freelancehub.payment.controller;

import com.freelancehub.freelancehub.contract.domain.Milestone;
import com.freelancehub.freelancehub.contract.domain.MilestoneStatus;
import com.freelancehub.freelancehub.exception.UnauthorizedException;
import com.freelancehub.freelancehub.payment.dto.CheckoutSessionResponse;
import com.freelancehub.freelancehub.payment.dto.StripeConnectResponse;
import com.freelancehub.freelancehub.payment.service.PaymentService;
import com.freelancehub.freelancehub.payment.service.StripeConnectService;
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

import java.util.stream.Stream;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = PaymentController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = {JwtAuthFilter.class, InternalApiFilter.class}
        )
)
class PaymentControllerTest extends WebMvcControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @ParameterizedTest(name = "{0}")
    @MethodSource("paymentEndpoints")
    void paymentEndpoint_whenMissingInternalToken_returnsUnauthorized(String testName, PaymentEndpoint endpoint) throws Exception {
        perform(endpoint, endpoint.correctUser())
                .andExpect(status().isUnauthorized());
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("paymentEndpoints")
    void paymentEndpoint_whenMissingAuthenticationWithInternalToken_returnsUnauthorized(String testName, PaymentEndpoint endpoint) throws Exception {
        perform(endpoint, internalApi())
                .andExpect(status().isUnauthorized());
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("paymentEndpoints")
    void paymentEndpoint_whenAuthenticatedWrongRoleWithInternalToken_returnsForbidden(String testName, PaymentEndpoint endpoint) throws Exception {
        perform(endpoint, internalApi(), endpoint.wrongRoleUser())
                .andExpect(status().isForbidden());
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("paymentEndpoints")
    void paymentEndpoint_whenAuthenticatedCorrectRoleWithInternalToken_returnsSuccess(String testName, PaymentEndpoint endpoint) throws Exception {
        perform(endpoint, internalApi(), endpoint.correctUser())
                .andExpect(status().is2xxSuccessful());
    }

    @Test
    void fundMilestone_whenAuthenticatedForeignClient_returnsUnauthorized() throws Exception {
        perform(new PaymentEndpoint("fundMilestone", HttpMethod.POST, "/api/v1/milestones/ms-1/fund", clientUser(), freelancerUser()),
                internalApi(), foreignClientUser())
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Only the contract's client can fund this milestone"));
    }

    @Test
    void paymentRefundRoute_whenAuthenticatedForeignClient_returnsUnauthorized() throws Exception {
        perform(new PaymentEndpoint("paymentRefundRoute", HttpMethod.POST, "/api/v1/milestones/ms-1/refund", clientUser(), freelancerUser()),
                internalApi(), foreignClientUser())
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Only the client can refund this milestone"));
    }

    @Test
    void fundMilestone_whenMilestoneCannotBeFunded_returnsBadRequest() throws Exception {
        perform(new PaymentEndpoint("fundMilestone", HttpMethod.POST, "/api/v1/milestones/not-pending/fund", clientUser(), freelancerUser()),
                internalApi(), clientUser())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Only PENDING milestones can be funded. Current status: FUNDED"));
    }

    @Test
    void paymentRefundRoute_whenMilestoneCannotBeRefunded_returnsBadRequest() throws Exception {
        perform(new PaymentEndpoint("paymentRefundRoute", HttpMethod.POST, "/api/v1/milestones/not-funded/refund", clientUser(), freelancerUser()),
                internalApi(), clientUser())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Only FUNDED milestones (not yet submitted) can be refunded directly. Use dispute for submitted milestones."));
    }

    private ResultActions perform(PaymentEndpoint endpoint, RequestPostProcessor... processors) throws Exception {
        MockHttpServletRequestBuilder request = request(endpoint.method(), endpoint.path())
                .accept(MediaType.APPLICATION_JSON);

        for (RequestPostProcessor processor : processors) {
            request.with(processor);
        }

        return mockMvc.perform(request);
    }

    private static Stream<Arguments> paymentEndpoints() {
        return Stream.of(
                Arguments.of("fundMilestone", new PaymentEndpoint("fundMilestone", HttpMethod.POST,
                        "/api/v1/milestones/ms-1/fund", clientUser(), freelancerUser())),
                Arguments.of("paymentRefundRoute", new PaymentEndpoint("paymentRefundRoute", HttpMethod.POST,
                        "/api/v1/milestones/ms-1/refund", clientUser(), freelancerUser())),
                Arguments.of("startOnboarding", new PaymentEndpoint("startOnboarding", HttpMethod.POST,
                        "/api/v1/stripe/connect/onboard", freelancerUser(), clientUser())),
                Arguments.of("getConnectStatus", new PaymentEndpoint("getConnectStatus", HttpMethod.GET,
                        "/api/v1/stripe/connect/status", freelancerUser(), clientUser()))
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

    private record PaymentEndpoint(
            String name,
            HttpMethod method,
            String path,
            RequestPostProcessor correctUser,
            RequestPostProcessor wrongRoleUser
    ) {}

    @TestConfiguration
    static class PaymentServiceTestConfig {

        @Bean
        StubPaymentService paymentService() {
            return new StubPaymentService();
        }

        @Bean
        StubStripeConnectService stripeConnectService() {
            return new StubStripeConnectService();
        }
    }

    public static class StubPaymentService extends PaymentService {

        public StubPaymentService() {
            super(null, null, null);
        }

        @Override
        public CheckoutSessionResponse fundMilestone(String milestoneId, String clientId, String clientEmail) {
            if (!"client-1".equals(clientId)) {
                throw new UnauthorizedException("Only the contract's client can fund this milestone");
            }
            if ("not-pending".equals(milestoneId)) {
                throw new IllegalStateException("Only PENDING milestones can be funded. Current status: FUNDED");
            }

            return new CheckoutSessionResponse("https://checkout.stripe.test/session", "cs_test_123");
        }

        @Override
        public Milestone findAndAssertClient(String milestoneId, String clientId) {
            if (!"client-1".equals(clientId)) {
                throw new UnauthorizedException("Only the client can refund this milestone");
            }
            if ("not-funded".equals(milestoneId)) {
                throw new IllegalStateException("Only FUNDED milestones (not yet submitted) can be refunded directly. Use dispute for submitted milestones.");
            }

            Milestone milestone = new Milestone();
            milestone.setId(milestoneId);
            milestone.setStatus(MilestoneStatus.FUNDED);
            return milestone;
        }

        @Override
        public void refundPayment(Milestone milestone) {
        }
    }

    public static class StubStripeConnectService extends StripeConnectService {

        public StubStripeConnectService() {
            super(null);
        }

        @Override
        public StripeConnectResponse startOnboarding(String freelancerId) {
            return StripeConnectResponse.withUrl("https://connect.stripe.test/onboard");
        }

        @Override
        public boolean isOnboarded(String freelancerId) {
            return true;
        }
    }
}
