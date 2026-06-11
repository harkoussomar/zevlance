package com.freelancehub.freelancehub.user.controller;

import com.freelancehub.freelancehub.user.dto.ClientProfileResponse;
import com.freelancehub.freelancehub.user.dto.FreelancerProfileResponse;
import com.freelancehub.freelancehub.user.dto.UpdateClientProfileRequest;
import com.freelancehub.freelancehub.user.dto.UpdateFreelancerProfileRequest;
import com.freelancehub.freelancehub.user.dto.UpdatePasswordRequest;
import com.freelancehub.freelancehub.user.service.ProfileService;
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

import java.util.List;
import java.util.stream.Stream;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = UserController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = {JwtAuthFilter.class, InternalApiFilter.class}
        )
)
class UserControllerTest extends WebMvcControllerTest {

    private static final String VALID_CLIENT_PROFILE_BODY = """
            {
              "name": "Client User",
              "companyName": "Acme",
              "companyDescription": "A product studio",
              "website": "https://acme.test"
            }
            """;

    private static final String VALID_FREELANCER_PROFILE_BODY = """
            {
              "name": "Freelancer User",
              "bio": "Senior Java engineer",
              "hourlyRate": 120,
              "skills": ["Java", "Spring"]
            }
            """;

    private static final String VALID_PASSWORD_BODY = """
            {
              "currentPassword": "old-password",
              "newPassword": "new-password"
            }
            """;

    @Autowired
    private MockMvc mockMvc;

    @ParameterizedTest(name = "{0}")
    @MethodSource("userEndpoints")
    void userEndpoint_whenMissingInternalToken_returnsUnauthorized(String testName, UserEndpoint endpoint) throws Exception {
        perform(endpoint, endpoint.successUser())
                .andExpect(status().isUnauthorized());
    }

    @Test
    void publicFreelancerProfile_whenMissingAuthenticationWithInternalToken_returnsSuccess() throws Exception {
        perform(publicFreelancerEndpoint(), internalApi())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("freelancer-1"));
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("authenticatedUserEndpoints")
    void userEndpoint_whenMissingAuthenticationWithInternalToken_returnsUnauthorized(String testName, UserEndpoint endpoint) throws Exception {
        perform(endpoint, internalApi())
                .andExpect(status().isUnauthorized());
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("clientOnlyEndpoints")
    void clientProfileEndpoint_whenAuthenticatedFreelancer_returnsForbidden(String testName, UserEndpoint endpoint) throws Exception {
        perform(endpoint, internalApi(), freelancerUser())
                .andExpect(status().isForbidden());
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("freelancerOnlyEndpoints")
    void freelancerProfileEndpoint_whenAuthenticatedClient_returnsForbidden(String testName, UserEndpoint endpoint) throws Exception {
        perform(endpoint, internalApi(), clientUser())
                .andExpect(status().isForbidden());
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("authenticatedUserEndpoints")
    void userEndpoint_whenAuthenticatedCorrectUser_returnsSuccess(String testName, UserEndpoint endpoint) throws Exception {
        perform(endpoint, internalApi(), endpoint.successUser())
                .andExpect(status().is2xxSuccessful());
    }

    @Test
    void getMyBasicProfile_whenAuthenticatedClient_returnsBasicProfile() throws Exception {
        perform(new UserEndpoint("getMyBasicProfile", HttpMethod.GET, "/api/v1/users/me", null, clientUser()),
                internalApi(), clientUser())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("client-1"))
                .andExpect(jsonPath("$.role").value("CLIENT"));
    }

    @Test
    void updateClientProfile_whenMissingRequestBody_returnsBadRequest() throws Exception {
        perform(new UserEndpoint("updateClientProfile", HttpMethod.PATCH, "/api/v1/users/me/client-profile",
                null, clientUser()), internalApi(), clientUser())
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateClientProfile_whenInvalidRequestBody_returnsBadRequest() throws Exception {
        perform(new UserEndpoint("updateClientProfile", HttpMethod.PATCH, "/api/v1/users/me/client-profile",
                "{\"name\":\"x\",\"website\":\"not-a-url\"}", clientUser()), internalApi(), clientUser())
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateFreelancerProfile_whenMissingRequestBody_returnsBadRequest() throws Exception {
        perform(new UserEndpoint("updateFreelancerProfile", HttpMethod.PATCH, "/api/v1/users/me/freelancer-profile",
                null, freelancerUser()), internalApi(), freelancerUser())
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateFreelancerProfile_whenInvalidRequestBody_returnsBadRequest() throws Exception {
        perform(new UserEndpoint("updateFreelancerProfile", HttpMethod.PATCH, "/api/v1/users/me/freelancer-profile",
                "{\"name\":\"x\",\"hourlyRate\":0,\"skills\":[\"\"]}", freelancerUser()), internalApi(), freelancerUser())
                .andExpect(status().isBadRequest());
    }

    @Test
    void changePassword_whenMissingRequestBody_returnsBadRequest() throws Exception {
        perform(new UserEndpoint("changePassword", HttpMethod.PATCH, "/api/v1/users/me/password",
                null, clientUser()), internalApi(), clientUser())
                .andExpect(status().isBadRequest());
    }

    @Test
    void changePassword_whenInvalidRequestBody_returnsBadRequest() throws Exception {
        perform(new UserEndpoint("changePassword", HttpMethod.PATCH, "/api/v1/users/me/password",
                "{\"currentPassword\":\"\",\"newPassword\":\"short\"}", clientUser()), internalApi(), clientUser())
                .andExpect(status().isBadRequest());
    }

    @Test
    void changePassword_whenCurrentPasswordIsIncorrect_returnsBadRequest() throws Exception {
        perform(new UserEndpoint("changePassword", HttpMethod.PATCH, "/api/v1/users/me/password",
                VALID_PASSWORD_BODY.replace("old-password", "wrong-password"), clientUser()), internalApi(), clientUser())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Current password is incorrect"));
    }

    @Test
    void changePassword_whenNewPasswordMatchesCurrent_returnsBadRequest() throws Exception {
        perform(new UserEndpoint("changePassword", HttpMethod.PATCH, "/api/v1/users/me/password",
                VALID_PASSWORD_BODY.replace("new-password", "old-password"), clientUser()), internalApi(), clientUser())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("New password must differ from current password"));
    }

    private ResultActions perform(UserEndpoint endpoint, RequestPostProcessor... processors) throws Exception {
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

    private static Stream<Arguments> userEndpoints() {
        return Stream.concat(Stream.of(Arguments.of("getPublicFreelancerProfile", publicFreelancerEndpoint())),
                authenticatedUserEndpoints());
    }

    private static Stream<Arguments> authenticatedUserEndpoints() {
        return Stream.of(
                Arguments.of("getMyBasicProfile", new UserEndpoint("getMyBasicProfile", HttpMethod.GET,
                        "/api/v1/users/me", null, clientUser())),
                Arguments.of("getMyClientProfile", new UserEndpoint("getMyClientProfile", HttpMethod.GET,
                        "/api/v1/users/me/client-profile", null, clientUser())),
                Arguments.of("getMyFreelancerProfile", new UserEndpoint("getMyFreelancerProfile", HttpMethod.GET,
                        "/api/v1/users/me/freelancer-profile", null, freelancerUser())),
                Arguments.of("updateClientProfile", new UserEndpoint("updateClientProfile", HttpMethod.PATCH,
                        "/api/v1/users/me/client-profile", VALID_CLIENT_PROFILE_BODY, clientUser())),
                Arguments.of("updateFreelancerProfile", new UserEndpoint("updateFreelancerProfile", HttpMethod.PATCH,
                        "/api/v1/users/me/freelancer-profile", VALID_FREELANCER_PROFILE_BODY, freelancerUser())),
                Arguments.of("changePassword", new UserEndpoint("changePassword", HttpMethod.PATCH,
                        "/api/v1/users/me/password", VALID_PASSWORD_BODY, clientUser()))
        );
    }

    private static Stream<Arguments> clientOnlyEndpoints() {
        return Stream.of(
                Arguments.of("getMyClientProfile", new UserEndpoint("getMyClientProfile", HttpMethod.GET,
                        "/api/v1/users/me/client-profile", null, clientUser())),
                Arguments.of("updateClientProfile", new UserEndpoint("updateClientProfile", HttpMethod.PATCH,
                        "/api/v1/users/me/client-profile", VALID_CLIENT_PROFILE_BODY, clientUser()))
        );
    }

    private static Stream<Arguments> freelancerOnlyEndpoints() {
        return Stream.of(
                Arguments.of("getMyFreelancerProfile", new UserEndpoint("getMyFreelancerProfile", HttpMethod.GET,
                        "/api/v1/users/me/freelancer-profile", null, freelancerUser())),
                Arguments.of("updateFreelancerProfile", new UserEndpoint("updateFreelancerProfile", HttpMethod.PATCH,
                        "/api/v1/users/me/freelancer-profile", VALID_FREELANCER_PROFILE_BODY, freelancerUser()))
        );
    }

    private static UserEndpoint publicFreelancerEndpoint() {
        return new UserEndpoint("getPublicFreelancerProfile", HttpMethod.GET,
                "/api/v1/freelancers/freelancer-1", null, clientUser());
    }

    private record UserEndpoint(
            String name,
            HttpMethod method,
            String path,
            String body,
            RequestPostProcessor successUser
    ) {}

    @TestConfiguration
    static class ProfileServiceTestConfig {

        @Bean
        StubProfileService profileService() {
            return new StubProfileService();
        }
    }

    public static class StubProfileService extends ProfileService {

        public StubProfileService() {
            super(null, null, null, null);
        }

        @Override
        public ClientProfileResponse getClientProfile(String clientId) {
            return clientProfile(clientId);
        }

        @Override
        public ClientProfileResponse updateClientProfile(String clientId, UpdateClientProfileRequest req) {
            return clientProfile(clientId);
        }

        @Override
        public FreelancerProfileResponse getFreelancerProfile(String freelancerId) {
            return freelancerProfile(freelancerId);
        }

        @Override
        public FreelancerProfileResponse updateFreelancerProfile(String freelancerId, UpdateFreelancerProfileRequest req) {
            return freelancerProfile(freelancerId);
        }

        @Override
        public void changePassword(String userId, UpdatePasswordRequest req) {
            if (!"old-password".equals(req.currentPassword())) {
                throw new IllegalArgumentException("Current password is incorrect");
            }
            if (req.currentPassword().equals(req.newPassword())) {
                throw new IllegalArgumentException("New password must differ from current password");
            }
        }

        private ClientProfileResponse clientProfile(String clientId) {
            return new ClientProfileResponse(
                    clientId,
                    "Client User",
                    "client@example.com",
                    "CLIENT",
                    "https://images.test/client.jpg",
                    "Acme",
                    "A product studio",
                    "https://acme.test",
                    4.8,
                    3
            );
        }

        private FreelancerProfileResponse freelancerProfile(String freelancerId) {
            return new FreelancerProfileResponse(
                    freelancerId,
                    "Freelancer User",
                    "freelancer@example.com",
                    "FREELANCER",
                    "https://images.test/freelancer.jpg",
                    "Senior Java engineer",
                    120.0,
                    4.9,
                    List.of("Java", "Spring"),
                    8
            );
        }
    }
}
