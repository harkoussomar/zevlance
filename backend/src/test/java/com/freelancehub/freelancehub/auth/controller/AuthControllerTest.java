package com.freelancehub.freelancehub.auth.controller;

import com.freelancehub.freelancehub.auth.dto.AuthResponse;
import com.freelancehub.freelancehub.auth.dto.ForgotPasswordRequest;
import com.freelancehub.freelancehub.auth.dto.LoginRequest;
import com.freelancehub.freelancehub.auth.dto.LoginResult;
import com.freelancehub.freelancehub.auth.dto.RegisterClientRequest;
import com.freelancehub.freelancehub.auth.dto.RegisterFreelancerRequest;
import com.freelancehub.freelancehub.auth.dto.ResetPasswordRequest;
import com.freelancehub.freelancehub.auth.service.AuthService;
import com.freelancehub.freelancehub.exception.ConflictException;
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
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.ResultMatcher;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = AuthController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = {JwtAuthFilter.class, InternalApiFilter.class}
        )
)
class AuthControllerTest extends WebMvcControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @ParameterizedTest(name = "{0}")
    @MethodSource("authEndpoints")
    void authEndpoint_whenMissingInternalToken_returnsUnauthorized(String testName, AuthEndpoint endpoint) throws Exception {
        perform(endpoint, adminUser())
                .andExpect(status().isUnauthorized());
    }

    @Test
    void registerFreelancer_whenValidRequest_returnsCreatedWithSessionCookies() throws Exception {
        perform(registerFreelancer("freelancer@example.com"), internalApi())
                .andExpect(status().isCreated())
                .andExpect(setCookieContains("jwt=test-token"))
                .andExpect(setCookieContains("has_session=true"))
                .andExpect(setCookieContains("user_role=FREELANCER"))
                .andExpect(setCookieContains("email_verified=false"))
                .andExpect(jsonPath("$.email").value("freelancer@example.com"))
                .andExpect(jsonPath("$.role").value("FREELANCER"));
    }

    @Test
    void registerClient_whenValidRequest_returnsCreatedWithSessionCookies() throws Exception {
        perform(registerClient("client@example.com"), internalApi())
                .andExpect(status().isCreated())
                .andExpect(setCookieContains("jwt=test-token"))
                .andExpect(setCookieContains("has_session=true"))
                .andExpect(setCookieContains("user_role=CLIENT"))
                .andExpect(setCookieContains("email_verified=false"))
                .andExpect(jsonPath("$.email").value("client@example.com"))
                .andExpect(jsonPath("$.role").value("CLIENT"));
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("duplicateRegistrationEndpoints")
    void register_whenDuplicateEmail_returnsConflict(String testName, AuthEndpoint endpoint) throws Exception {
        perform(endpoint, internalApi())
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Email already registered"));
    }

    @Test
    void login_whenValidCredentials_returnsOkWithSessionCookies() throws Exception {
        perform(login("client@example.com", "password123"), internalApi())
                .andExpect(status().isOk())
                .andExpect(setCookieContains("jwt=test-token"))
                .andExpect(setCookieContains("has_session=true"))
                .andExpect(setCookieContains("user_role=CLIENT"))
                .andExpect(setCookieContains("email_verified=true"))
                .andExpect(jsonPath("$.email").value("client@example.com"))
                .andExpect(jsonPath("$.role").value("CLIENT"));
    }

    @Test
    void login_whenBadCredentials_returnsUnauthorized() throws Exception {
        perform(login("bad-login@example.com", "wrong-password"), internalApi())
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    void logout_whenCalledWithInternalToken_returnsClearingCookies() throws Exception {
        perform(new AuthEndpoint("logout", HttpMethod.POST, "/api/v1/auth/logout", null), internalApi())
                .andExpect(status().isOk())
                .andExpect(setCookieContains("jwt=;"))
                .andExpect(setCookieContains("has_session=;"))
                .andExpect(setCookieContains("user_role=;"))
                .andExpect(setCookieContains("email_verified=false"));
    }

    @Test
    void forgotPassword_whenEmailExists_returnsNoContent() throws Exception {
        perform(new AuthEndpoint("forgotPassword", HttpMethod.POST, "/api/v1/auth/forgot-password",
                "{\"email\":\"client@example.com\"}"), internalApi())
                .andExpect(status().isNoContent());
    }

    @Test
    void resetPassword_whenValidToken_returnsNoContent() throws Exception {
        perform(new AuthEndpoint("resetPassword", HttpMethod.POST, "/api/v1/auth/reset-password",
                "{\"token\":\"valid-reset-token\",\"newPassword\":\"newPassword123\"}"), internalApi())
                .andExpect(status().isNoContent());
    }

    @Test
    void resetPassword_whenInvalidToken_returnsBadRequest() throws Exception {
        perform(new AuthEndpoint("resetPasswordInvalidToken", HttpMethod.POST, "/api/v1/auth/reset-password",
                "{\"token\":\"invalid-reset-token\",\"newPassword\":\"newPassword123\"}"), internalApi())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid or expired reset token"));
    }

    @Test
    void verifyEmail_whenValidToken_returnsOkWithVerifiedCookie() throws Exception {
        perform(new AuthEndpoint("verifyEmail", HttpMethod.POST, "/api/v1/auth/verify-email?token=valid-email-token", null), internalApi())
                .andExpect(status().isOk())
                .andExpect(setCookieContains("email_verified=true"));
    }

    @Test
    void verifyEmail_whenInvalidToken_returnsBadRequest() throws Exception {
        perform(new AuthEndpoint("verifyEmailInvalidToken", HttpMethod.POST, "/api/v1/auth/verify-email?token=invalid-email-token", null), internalApi())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid or expired verification link"));
    }

    @Test
    void verifyEmail_whenMissingToken_returnsBadRequest() throws Exception {
        perform(new AuthEndpoint("verifyEmailMissingToken", HttpMethod.POST, "/api/v1/auth/verify-email", null), internalApi())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Missing required request parameter: token"));
    }

    @Test
    void resendVerification_whenMissingAuthenticationWithInternalToken_returnsUnauthorized() throws Exception {
        perform(new AuthEndpoint("resendVerification", HttpMethod.POST, "/api/v1/auth/resend-verification", null), internalApi())
                .andExpect(status().isUnauthorized());
    }

    @Test
    void resendVerification_whenAuthenticatedUserWithInternalToken_returnsNoContent() throws Exception {
        perform(new AuthEndpoint("resendVerification", HttpMethod.POST, "/api/v1/auth/resend-verification", null),
                internalApi(), freelancerUser())
                .andExpect(status().isNoContent());
    }

    @Test
    void me_whenMissingAuthenticationWithInternalToken_returnsUnauthorized() throws Exception {
        perform(new AuthEndpoint("me", HttpMethod.GET, "/api/v1/auth/me", null), internalApi())
                .andExpect(status().isUnauthorized());
    }

    @Test
    void me_whenAuthenticatedUserWithInternalToken_returnsCurrentUser() throws Exception {
        perform(new AuthEndpoint("me", HttpMethod.GET, "/api/v1/auth/me", null), internalApi(), clientUser())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("client@example.com"))
                .andExpect(jsonPath("$.role").value("CLIENT"))
                .andExpect(jsonPath("$.userId").value("client-1"))
                .andExpect(jsonPath("$.name").value("Client User"))
                .andExpect(jsonPath("$.emailVerified").value(true));
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("bodyEndpoints")
    void authEndpointWithBody_whenMissingRequestBody_returnsBadRequest(String testName, AuthEndpoint endpoint) throws Exception {
        perform(endpoint.withBody(null), internalApi())
                .andExpect(status().isBadRequest());
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("invalidBodyEndpoints")
    void authEndpointWithBody_whenInvalidRequestBody_returnsBadRequest(String testName, AuthEndpoint endpoint) throws Exception {
        perform(endpoint, internalApi())
                .andExpect(status().isBadRequest());
    }

    private ResultActions perform(AuthEndpoint endpoint, RequestPostProcessor... processors) throws Exception {
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

    private static ResultMatcher setCookieContains(String fragment) {
        return result -> assertThat(result.getResponse().getHeaders("Set-Cookie"))
                .anySatisfy(cookie -> assertThat(cookie).contains(fragment));
    }

    private static Stream<Arguments> authEndpoints() {
        return Stream.of(
                Arguments.of("registerFreelancer", registerFreelancer("freelancer@example.com")),
                Arguments.of("registerClient", registerClient("client@example.com")),
                Arguments.of("login", login("client@example.com", "password123")),
                Arguments.of("logout", new AuthEndpoint("logout", HttpMethod.POST, "/api/v1/auth/logout", null)),
                Arguments.of("forgotPassword", new AuthEndpoint("forgotPassword", HttpMethod.POST, "/api/v1/auth/forgot-password",
                        "{\"email\":\"client@example.com\"}")),
                Arguments.of("resetPassword", new AuthEndpoint("resetPassword", HttpMethod.POST, "/api/v1/auth/reset-password",
                        "{\"token\":\"valid-reset-token\",\"newPassword\":\"newPassword123\"}")),
                Arguments.of("verifyEmail", new AuthEndpoint("verifyEmail", HttpMethod.POST, "/api/v1/auth/verify-email?token=valid-email-token", null)),
                Arguments.of("resendVerification", new AuthEndpoint("resendVerification", HttpMethod.POST, "/api/v1/auth/resend-verification", null)),
                Arguments.of("me", new AuthEndpoint("me", HttpMethod.GET, "/api/v1/auth/me", null))
        );
    }

    private static Stream<Arguments> duplicateRegistrationEndpoints() {
        return Stream.of(
                Arguments.of("registerFreelancer", registerFreelancer("duplicate@example.com")),
                Arguments.of("registerClient", registerClient("duplicate@example.com"))
        );
    }

    private static Stream<Arguments> bodyEndpoints() {
        return Stream.of(
                Arguments.of("registerFreelancer", registerFreelancer("freelancer@example.com")),
                Arguments.of("registerClient", registerClient("client@example.com")),
                Arguments.of("login", login("client@example.com", "password123")),
                Arguments.of("forgotPassword", new AuthEndpoint("forgotPassword", HttpMethod.POST, "/api/v1/auth/forgot-password",
                        "{\"email\":\"client@example.com\"}")),
                Arguments.of("resetPassword", new AuthEndpoint("resetPassword", HttpMethod.POST, "/api/v1/auth/reset-password",
                        "{\"token\":\"valid-reset-token\",\"newPassword\":\"newPassword123\"}"))
        );
    }

    private static Stream<Arguments> invalidBodyEndpoints() {
        return Stream.of(
                Arguments.of("registerFreelancer", new AuthEndpoint("registerFreelancer", HttpMethod.POST, "/api/v1/auth/register/freelancer",
                        "{\"name\":\"\",\"email\":\"not-email\",\"password\":\"short\"}")),
                Arguments.of("registerClient", new AuthEndpoint("registerClient", HttpMethod.POST, "/api/v1/auth/register/client",
                        "{\"name\":\"\",\"email\":\"not-email\",\"password\":\"short\"}")),
                Arguments.of("login", login("not-email", "")),
                Arguments.of("forgotPassword", new AuthEndpoint("forgotPassword", HttpMethod.POST, "/api/v1/auth/forgot-password",
                        "{\"email\":\"not-email\"}")),
                Arguments.of("resetPassword", new AuthEndpoint("resetPassword", HttpMethod.POST, "/api/v1/auth/reset-password",
                        "{\"token\":\"\",\"newPassword\":\"short\"}"))
        );
    }

    private static AuthEndpoint registerFreelancer(String email) {
        return new AuthEndpoint("registerFreelancer", HttpMethod.POST, "/api/v1/auth/register/freelancer",
                "{\"name\":\"Freelancer User\",\"email\":\"" + email + "\",\"password\":\"password123\",\"phone\":\"123\"}");
    }

    private static AuthEndpoint registerClient(String email) {
        return new AuthEndpoint("registerClient", HttpMethod.POST, "/api/v1/auth/register/client",
                "{\"name\":\"Client User\",\"email\":\"" + email + "\",\"password\":\"password123\",\"phone\":\"123\","
                        + "\"companyName\":\"Acme\",\"companyDescription\":\"Builds things\",\"website\":\"https://example.com\"}");
    }

    private static AuthEndpoint login(String email, String password) {
        return new AuthEndpoint("login", HttpMethod.POST, "/api/v1/auth/login",
                "{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}");
    }

    private record AuthEndpoint(String name, HttpMethod method, String path, String body) {
        AuthEndpoint withBody(String replacementBody) {
            return new AuthEndpoint(name, method, path, replacementBody);
        }
    }

    @TestConfiguration
    static class AuthServiceTestConfig {

        @Bean
        StubAuthService authService() {
            return new StubAuthService();
        }
    }

    public static class StubAuthService extends AuthService {

        public StubAuthService() {
            super(null, null, null, null, null, null, null);
        }

        @Override
        public LoginResult registerFreelancer(RegisterFreelancerRequest request) {
            if ("duplicate@example.com".equals(request.email())) {
                throw new ConflictException("Email already registered");
            }

            return result(request.email(), "FREELANCER", "freelancer-1", request.name(), false);
        }

        @Override
        public LoginResult registerClient(RegisterClientRequest request) {
            if ("duplicate@example.com".equals(request.email())) {
                throw new ConflictException("Email already registered");
            }

            return result(request.email(), "CLIENT", "client-1", request.name(), false);
        }

        @Override
        public LoginResult login(LoginRequest request) {
            if ("bad-login@example.com".equals(request.email())) {
                throw new BadCredentialsException("Bad credentials");
            }

            return result(request.email(), "CLIENT", "client-1", "Client User", true);
        }

        @Override
        public void forgotPassword(String email) {
        }

        @Override
        public void resetPassword(String token, String newPassword) {
            if ("invalid-reset-token".equals(token)) {
                throw new IllegalArgumentException("Invalid or expired reset token");
            }
        }

        @Override
        public void verifyEmail(String token) {
            if ("invalid-email-token".equals(token)) {
                throw new IllegalArgumentException("Invalid or expired verification link");
            }
        }

        @Override
        public void resendVerification(String email) {
        }

        private LoginResult result(String email, String role, String userId, String name, boolean emailVerified) {
            return new LoginResult(
                    "test-token",
                    new AuthResponse(email, role, userId, name, emailVerified)
            );
        }
    }
}
