package com.freelancehub.freelancehub.project.controller;

import com.freelancehub.freelancehub.exception.UnauthorizedException;
import com.freelancehub.freelancehub.project.domain.ProjectCategory;
import com.freelancehub.freelancehub.project.domain.ProjectStatus;
import com.freelancehub.freelancehub.project.dto.CreateProjectRequest;
import com.freelancehub.freelancehub.project.dto.ProjectFilter;
import com.freelancehub.freelancehub.project.dto.ProjectResponse;
import com.freelancehub.freelancehub.project.dto.ProjectSummaryResponse;
import com.freelancehub.freelancehub.project.dto.UpdateProjectRequest;
import com.freelancehub.freelancehub.project.service.ProjectService;
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
import java.util.List;
import java.util.stream.Stream;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = ProjectController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = {JwtAuthFilter.class, InternalApiFilter.class}
        )
)
class ProjectControllerTest extends WebMvcControllerTest {

    private static final String VALID_CREATE_BODY = """
            {
              "title": "Build a marketplace",
              "description": "A detailed project description",
              "budgetMin": 1000,
              "budgetMax": 3000,
              "category": "WEB_DEV",
              "requiredSkills": ["Java", "React"],
              "deadline": "2030-01-01"
            }
            """;

    private static final String VALID_UPDATE_BODY = """
            {
              "title": "Build a better marketplace",
              "budgetMin": 1200,
              "budgetMax": 3200,
              "deadline": "2030-02-01"
            }
            """;

    @Autowired
    private MockMvc mockMvc;

    @ParameterizedTest(name = "{0}")
    @MethodSource("allProjectEndpoints")
    void projectEndpoint_whenMissingInternalToken_returnsUnauthorized(String testName, ProjectEndpoint endpoint) throws Exception {
        perform(endpoint, endpoint.correctUser())
                .andExpect(status().isUnauthorized());
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("publicProjectEndpoints")
    void publicProjectEndpoint_whenMissingAuthenticationWithInternalToken_returnsSuccess(String testName, ProjectEndpoint endpoint) throws Exception {
        perform(endpoint, internalApi())
                .andExpect(status().isOk());
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("protectedProjectEndpoints")
    void protectedProjectEndpoint_whenMissingAuthenticationWithInternalToken_returnsUnauthorized(String testName, ProjectEndpoint endpoint) throws Exception {
        perform(endpoint, internalApi())
                .andExpect(status().isUnauthorized());
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("protectedProjectEndpoints")
    void protectedProjectEndpoint_whenAuthenticatedWrongRoleWithInternalToken_returnsForbidden(String testName, ProjectEndpoint endpoint) throws Exception {
        perform(endpoint, internalApi(), freelancerUser())
                .andExpect(status().isForbidden());
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("protectedProjectEndpoints")
    void protectedProjectEndpoint_whenAuthenticatedClientWithInternalToken_returnsSuccess(String testName, ProjectEndpoint endpoint) throws Exception {
        ResultActions result = perform(endpoint, internalApi(), clientUser())
                .andExpect(status().is2xxSuccessful());

        if ("createProject".equals(endpoint.name())) {
            result.andExpect(header().string("Location", "http://localhost/api/v1/projects/project-1"));
        }
    }

    @Test
    void createProject_whenMissingRequestBody_returnsBadRequest() throws Exception {
        perform(new ProjectEndpoint("createProject", HttpMethod.POST, "/api/v1/projects", null, clientUser()),
                internalApi(), clientUser())
                .andExpect(status().isBadRequest());
    }

    @Test
    void createProject_whenInvalidRequestBody_returnsBadRequest() throws Exception {
        perform(new ProjectEndpoint("createProject", HttpMethod.POST, "/api/v1/projects",
                "{\"title\":\"\",\"description\":\"\",\"budgetMin\":0,\"budgetMax\":0,\"deadline\":\"2000-01-01\"}", clientUser()),
                internalApi(), clientUser())
                .andExpect(status().isBadRequest());
    }

    @Test
    void createProject_whenBudgetMinExceedsBudgetMax_returnsBadRequest() throws Exception {
        perform(new ProjectEndpoint("createProject", HttpMethod.POST, "/api/v1/projects",
                VALID_CREATE_BODY.replace("\"budgetMin\": 1000", "\"budgetMin\": 4000"), clientUser()),
                internalApi(), clientUser())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Budget min cannot be greater than budget max"));
    }

    @Test
    void updateProject_whenMissingRequestBody_returnsBadRequest() throws Exception {
        perform(new ProjectEndpoint("updateProject", HttpMethod.PUT, "/api/v1/projects/project-1", null, clientUser()),
                internalApi(), clientUser())
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateProject_whenInvalidRequestBody_returnsBadRequest() throws Exception {
        perform(new ProjectEndpoint("updateProject", HttpMethod.PUT, "/api/v1/projects/project-1",
                "{\"title\":\"x\",\"budgetMin\":0,\"deadline\":\"2000-01-01\"}", clientUser()),
                internalApi(), clientUser())
                .andExpect(status().isBadRequest());
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("ownerEnforcedEndpoints")
    void ownerProjectEndpoint_whenAuthenticatedForeignClient_returnsUnauthorized(String testName, ProjectEndpoint endpoint) throws Exception {
        perform(endpoint, internalApi(), foreignClientUser())
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("You do not own this project"));
    }

    @Test
    void updateProject_whenProjectIsNotOpen_returnsBadRequest() throws Exception {
        perform(new ProjectEndpoint("updateProject", HttpMethod.PUT, "/api/v1/projects/not-open-project", VALID_UPDATE_BODY, clientUser()),
                internalApi(), clientUser())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Only OPEN projects can be edited"));
    }

    @Test
    void cancelProject_whenProjectIsCompleted_returnsBadRequest() throws Exception {
        perform(new ProjectEndpoint("cancelProject", HttpMethod.PUT, "/api/v1/projects/completed-project/cancel", null, clientUser()),
                internalApi(), clientUser())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Cannot cancel a completed project"));
    }

    private ResultActions perform(ProjectEndpoint endpoint, RequestPostProcessor... processors) throws Exception {
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

    private static Stream<Arguments> allProjectEndpoints() {
        return Stream.concat(publicProjectEndpoints(), protectedProjectEndpoints());
    }

    private static Stream<Arguments> publicProjectEndpoints() {
        return Stream.of(
                Arguments.of("getProjects", new ProjectEndpoint("getProjects", HttpMethod.GET,
                        "/api/v1/projects?category=WEB_DEV&skill=Java&query=marketplace", null, clientUser())),
                Arguments.of("getProject", new ProjectEndpoint("getProject", HttpMethod.GET,
                        "/api/v1/projects/project-1", null, clientUser()))
        );
    }

    private static Stream<Arguments> protectedProjectEndpoints() {
        return Stream.of(
                Arguments.of("getMyProjects", new ProjectEndpoint("getMyProjects", HttpMethod.GET,
                        "/api/v1/projects/my", null, clientUser())),
                Arguments.of("createProject", new ProjectEndpoint("createProject", HttpMethod.POST,
                        "/api/v1/projects", VALID_CREATE_BODY, clientUser())),
                Arguments.of("updateProject", new ProjectEndpoint("updateProject", HttpMethod.PUT,
                        "/api/v1/projects/project-1", VALID_UPDATE_BODY, clientUser())),
                Arguments.of("cancelProject", new ProjectEndpoint("cancelProject", HttpMethod.PUT,
                        "/api/v1/projects/project-1/cancel", null, clientUser()))
        );
    }

    private static Stream<Arguments> ownerEnforcedEndpoints() {
        return Stream.of(
                Arguments.of("updateProject", new ProjectEndpoint("updateProject", HttpMethod.PUT,
                        "/api/v1/projects/project-1", VALID_UPDATE_BODY, clientUser())),
                Arguments.of("cancelProject", new ProjectEndpoint("cancelProject", HttpMethod.PUT,
                        "/api/v1/projects/project-1/cancel", null, clientUser()))
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

    private record ProjectEndpoint(
            String name,
            HttpMethod method,
            String path,
            String body,
            RequestPostProcessor correctUser
    ) {}

    @TestConfiguration
    static class ProjectServiceTestConfig {

        @Bean
        StubProjectService projectService() {
            return new StubProjectService();
        }
    }

    public static class StubProjectService extends ProjectService {

        public StubProjectService() {
            super(null, null);
        }

        @Override
        public Page<ProjectSummaryResponse> getProjects(ProjectFilter filter, Pageable pageable) {
            return Page.empty();
        }

        @Override
        public ProjectResponse getProject(String projectId) {
            return project(projectId, ProjectStatus.OPEN);
        }

        @Override
        public Page<ProjectSummaryResponse> getMyProjects(String clientId, Pageable pageable) {
            assertClient(clientId);
            return Page.empty();
        }

        @Override
        public ProjectResponse createProject(CreateProjectRequest request, String clientId) {
            assertClient(clientId);
            if (request.budgetMin().compareTo(request.budgetMax()) > 0) {
                throw new IllegalArgumentException("Budget min cannot be greater than budget max");
            }
            return project("project-1", ProjectStatus.OPEN);
        }

        @Override
        public ProjectResponse updateProject(String projectId, UpdateProjectRequest request, String clientId) {
            assertClient(clientId);
            if ("not-open-project".equals(projectId)) {
                throw new IllegalStateException("Only OPEN projects can be edited");
            }
            return project(projectId, ProjectStatus.OPEN);
        }

        @Override
        public void cancelProject(String projectId, String clientId) {
            assertClient(clientId);
            if ("completed-project".equals(projectId)) {
                throw new IllegalStateException("Cannot cancel a completed project");
            }
        }

        private void assertClient(String clientId) {
            if (!"client-1".equals(clientId)) {
                throw new UnauthorizedException("You do not own this project");
            }
        }

        private ProjectResponse project(String id, ProjectStatus status) {
            return new ProjectResponse(
                    id,
                    "Project One",
                    "A detailed project description",
                    BigDecimal.valueOf(1000),
                    BigDecimal.valueOf(3000),
                    status,
                    ProjectCategory.WEB_DEV,
                    List.of("Java", "React"),
                    LocalDate.now().plusDays(30),
                    "client-1",
                    "Client User",
                    "Acme",
                    0,
                    LocalDateTime.now()
            );
        }
    }
}
