package com.freelancehub.freelancehub.dashboard.controller;

import com.freelancehub.freelancehub.dashboard.dto.ClientDashboardResponse;
import com.freelancehub.freelancehub.dashboard.dto.ClientDashboardStats;
import com.freelancehub.freelancehub.dashboard.dto.FreelancerDashboardResponse;
import com.freelancehub.freelancehub.dashboard.dto.FreelancerDashboardStats;
import com.freelancehub.freelancehub.dashboard.dto.UserSummaryDto;
import com.freelancehub.freelancehub.dashboard.service.DashboardService;
import com.freelancehub.freelancehub.security.InternalApiFilter;
import com.freelancehub.freelancehub.security.JwtAuthFilter;
import com.freelancehub.freelancehub.web.support.WebMvcControllerTest;
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
import java.util.List;
import java.util.stream.Stream;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = DashboardController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = {JwtAuthFilter.class, InternalApiFilter.class}
        )
)
class DashboardControllerTest extends WebMvcControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @ParameterizedTest(name = "{0}")
    @MethodSource("dashboardEndpoints")
    void dashboardEndpoint_whenMissingInternalToken_returnsUnauthorized(String testName, DashboardEndpoint endpoint) throws Exception {
        perform(endpoint, endpoint.correctUser())
                .andExpect(status().isUnauthorized());
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("dashboardEndpoints")
    void dashboardEndpoint_whenMissingAuthenticationWithInternalToken_returnsUnauthorized(String testName, DashboardEndpoint endpoint) throws Exception {
        perform(endpoint, internalApi())
                .andExpect(status().isUnauthorized());
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("dashboardEndpoints")
    void dashboardEndpoint_whenAuthenticatedWrongRole_returnsForbidden(String testName, DashboardEndpoint endpoint) throws Exception {
        perform(endpoint, internalApi(), endpoint.wrongRoleUser())
                .andExpect(status().isForbidden());
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("dashboardEndpoints")
    void dashboardEndpoint_whenAuthenticatedCorrectRole_returnsSuccess(String testName, DashboardEndpoint endpoint) throws Exception {
        perform(endpoint, internalApi(), endpoint.correctUser())
                .andExpect(status().isOk());
    }

    private ResultActions perform(DashboardEndpoint endpoint, RequestPostProcessor... processors) throws Exception {
        MockHttpServletRequestBuilder request = request(endpoint.method(), endpoint.path())
                .accept(MediaType.APPLICATION_JSON);

        for (RequestPostProcessor processor : processors) {
            request.with(processor);
        }

        return mockMvc.perform(request);
    }

    private static Stream<Arguments> dashboardEndpoints() {
        return Stream.of(
                Arguments.of("getFreelancerDashboard", new DashboardEndpoint(HttpMethod.GET,
                        "/api/v1/dashboard/freelancer", freelancerUser(), clientUser())),
                Arguments.of("getClientDashboard", new DashboardEndpoint(HttpMethod.GET,
                        "/api/v1/dashboard/client", clientUser(), freelancerUser()))
        );
    }

    private record DashboardEndpoint(
            HttpMethod method,
            String path,
            RequestPostProcessor correctUser,
            RequestPostProcessor wrongRoleUser
    ) {}

    @TestConfiguration
    static class DashboardServiceTestConfig {

        @Bean
        StubDashboardService dashboardService() {
            return new StubDashboardService();
        }
    }

    public static class StubDashboardService extends DashboardService {

        public StubDashboardService() {
            super(null, null, null, null, null, null);
        }

        @Override
        public FreelancerDashboardResponse getFreelancerDashboard(String freelancerId) {
            return new FreelancerDashboardResponse(
                    new UserSummaryDto(freelancerId, "Freelancer User"),
                    new FreelancerDashboardStats(BigDecimal.valueOf(1000), 1, 2, 4.9, 3),
                    List.of(),
                    List.of(),
                    List.of()
            );
        }

        @Override
        public ClientDashboardResponse getClientDashboard(String clientId) {
            return new ClientDashboardResponse(
                    new UserSummaryDto(clientId, "Client User"),
                    new ClientDashboardStats(2, 1, 5, BigDecimal.valueOf(2000)),
                    List.of(),
                    List.of()
            );
        }
    }
}
