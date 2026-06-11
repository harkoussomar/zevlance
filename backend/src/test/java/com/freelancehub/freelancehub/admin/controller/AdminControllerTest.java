package com.freelancehub.freelancehub.admin.controller;

import com.freelancehub.freelancehub.admin.dto.AdminProjectDetailResponse;
import com.freelancehub.freelancehub.admin.dto.AdminProjectFilter;
import com.freelancehub.freelancehub.admin.dto.PlatformStatsResponse;
import com.freelancehub.freelancehub.admin.dto.UserResponse;
import com.freelancehub.freelancehub.admin.dto.UserDetailResponse;
import com.freelancehub.freelancehub.admin.domain.AdminAuditLog;
import com.freelancehub.freelancehub.admin.service.AdminService;
import com.freelancehub.freelancehub.project.domain.ProjectStatus;
import com.freelancehub.freelancehub.project.dto.ProjectSummaryResponse;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Stream;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = AdminController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = {JwtAuthFilter.class, InternalApiFilter.class}
        )
)
class AdminControllerTest extends WebMvcControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @ParameterizedTest(name = "{0}")
    @MethodSource("adminEndpoints")
    void adminEndpoint_whenMissingInternalToken_returnsUnauthorized(String testName, AdminEndpoint endpoint) throws Exception {
        perform(endpoint, adminUser())
                .andExpect(status().isUnauthorized());
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("adminEndpoints")
    void adminEndpoint_whenMissingAuthenticationWithInternalToken_returnsUnauthorized(String testName, AdminEndpoint endpoint) throws Exception {
        perform(endpoint, internalApi())
                .andExpect(status().isUnauthorized());
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("adminEndpoints")
    void adminEndpoint_whenAuthenticatedNonAdminWithInternalToken_returnsForbidden(String testName, AdminEndpoint endpoint) throws Exception {
        perform(endpoint, internalApi(), clientUser())
                .andExpect(status().isForbidden());
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("adminEndpoints")
    void adminEndpoint_whenAuthenticatedAdminWithInternalToken_returnsSuccess(String testName, AdminEndpoint endpoint) throws Exception {
        perform(endpoint, internalApi(), adminUser())
                .andExpect(status().is2xxSuccessful());
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("bodyEndpoints")
    void adminEndpointWithBody_whenMissingRequestBody_returnsBadRequest(String testName, AdminEndpoint endpoint) throws Exception {
        AdminEndpoint withoutBody = endpoint.withBody(null);

        perform(withoutBody, internalApi(), adminUser())
                .andExpect(status().isBadRequest());
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("bodyEndpoints")
    void adminEndpointWithBody_whenInvalidRequestBody_returnsBadRequest(String testName, AdminEndpoint endpoint) throws Exception {
        AdminEndpoint invalid = endpoint.withBody(endpoint.invalidBody());

        perform(invalid, internalApi(), adminUser())
                .andExpect(status().isBadRequest());
    }

    private ResultActions perform(AdminEndpoint endpoint, RequestPostProcessor... processors) throws Exception {
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

    private static UserDetailResponse userDetail() {
        LocalDateTime now = LocalDateTime.now();
        return new UserDetailResponse(
                "user-1",
                "user@example.com",
                "User One",
                null,
                null,
                "CLIENT",
                true,
                true,
                now,
                now,
                0L,
                null,
                0L,
                null,
                0L
        );
    }

    private static AdminProjectDetailResponse projectDetail() {
        LocalDateTime now = LocalDateTime.now();
        return new AdminProjectDetailResponse(
                "project-1",
                "Admin project",
                "Project visible to admins",
                BigDecimal.valueOf(100),
                BigDecimal.valueOf(200),
                ProjectStatus.OPEN,
                null,
                List.of("java"),
                null,
                "client-1",
                "Client User",
                "client@example.com",
                false,
                false,
                null,
                0,
                List.of(),
                null,
                now,
                now
        );
    }

    private static PlatformStatsResponse stats() {
        return new PlatformStatsResponse(
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0.0,
                BigDecimal.ZERO,
                List.of(),
                List.of()
        );
    }

    private static Stream<Arguments> adminEndpoints() {
        return endpoints()
                .map(endpoint -> Arguments.of(endpoint.name(), endpoint));
    }

    private static Stream<Arguments> bodyEndpoints() {
        return endpoints()
                .filter(endpoint -> endpoint.body() != null)
                .map(endpoint -> Arguments.of(endpoint.name(), endpoint));
    }

    private static Stream<AdminEndpoint> endpoints() {
        return Stream.of(
                new AdminEndpoint("getAllUsers", HttpMethod.GET, "/api/v1/admin/users", null, null),
                new AdminEndpoint("getUserDetail", HttpMethod.GET, "/api/v1/admin/users/user-1", null, null),
                new AdminEndpoint("suspendUser", HttpMethod.PATCH, "/api/v1/admin/users/user-1/suspend",
                        "{\"reason\":\"policy violation\"}", "{\"reason\":\"bad\"}"),
                new AdminEndpoint("activateUser", HttpMethod.PATCH, "/api/v1/admin/users/user-1/activate",
                        "{\"reason\":\"policy violation\"}", "{\"reason\":\"bad\"}"),
                new AdminEndpoint("getAllProjects", HttpMethod.GET, "/api/v1/admin/projects", null, null),
                new AdminEndpoint("getProjectDetail", HttpMethod.GET, "/api/v1/admin/projects/project-1", null, null),
                new AdminEndpoint("changeProjectStatus", HttpMethod.PATCH, "/api/v1/admin/projects/project-1/status",
                        "{\"status\":\"SUSPENDED\",\"reason\":\"policy violation\"}",
                        "{\"status\":null,\"reason\":\"bad\"}"),
                new AdminEndpoint("flagProject", HttpMethod.PATCH, "/api/v1/admin/projects/project-1/flag",
                        "{\"flagged\":true,\"reason\":\"policy violation\"}",
                        "{\"flagged\":true,\"reason\":\"bad\"}"),
                new AdminEndpoint("featureProject", HttpMethod.PATCH, "/api/v1/admin/projects/project-1/feature",
                        "{\"featured\":true}", "{\"featured\":\"not-boolean\"}"),
                new AdminEndpoint("deleteProject", HttpMethod.DELETE, "/api/v1/admin/projects/project-1",
                        "{\"reason\":\"policy violation\"}", "{\"reason\":\"bad\"}"),
                new AdminEndpoint("getProjectAuditLog", HttpMethod.GET, "/api/v1/admin/projects/project-1/audit-log", null, null),
                new AdminEndpoint("getStats", HttpMethod.GET, "/api/v1/admin/overview", null, null),
                new AdminEndpoint("getAuditLog", HttpMethod.GET, "/api/v1/admin/audit-log", null, null)
        );
    }

    private record AdminEndpoint(String name, HttpMethod method, String path, String body, String invalidBody) {
        AdminEndpoint withBody(String replacementBody) {
            return new AdminEndpoint(name, method, path, replacementBody, invalidBody);
        }
    }

    @TestConfiguration
    static class AdminServiceTestConfig {

        @Bean
        StubAdminService adminService() {
            return new StubAdminService();
        }
    }

    public static class StubAdminService extends AdminService {

        public StubAdminService() {
            super(null, null, null, null, null, null, null, null, null, null, null);
        }

        @Override
        public Page<UserResponse> getAllUsers(String role, String status, String search, Pageable pageable) {
            return Page.empty();
        }

        @Override
        public UserDetailResponse getUserDetail(String userId) {
            return userDetail();
        }

        @Override
        public void suspendUser(String userId, String reason) {
        }

        @Override
        public void activateUser(String userId, String reason) {
        }

        @Override
        public Page<ProjectSummaryResponse> getAllProjects(AdminProjectFilter filter, Pageable pageable) {
            return Page.empty();
        }

        @Override
        public AdminProjectDetailResponse getAdminProjectDetail(String projectId) {
            return projectDetail();
        }

        @Override
        public void changeProjectStatus(String projectId, ProjectStatus newStatus, String reason) {
        }

        @Override
        public void flagProject(String projectId, boolean flagged, String reason) {
        }

        @Override
        public void featureProject(String projectId, boolean featured) {
        }

        @Override
        public void deleteProject(String projectId, String reason) {
        }

        @Override
        public PlatformStatsResponse getStats() {
            return stats();
        }

        @Override
        public Page<AdminAuditLog> getAuditLogs(Pageable pageable) {
            return Page.empty();
        }

        @Override
        public Page<AdminAuditLog> getAuditLogsForProject(String projectId, Pageable pageable) {
            return Page.empty();
        }
    }
}
