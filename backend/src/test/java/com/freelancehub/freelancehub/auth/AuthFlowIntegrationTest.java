package com.freelancehub.freelancehub.auth;

import com.freelancehub.freelancehub.auth.controller.AuthController;
import com.freelancehub.freelancehub.auth.domain.EmailVerificationToken;
import com.freelancehub.freelancehub.auth.domain.PasswordResetToken;
import com.freelancehub.freelancehub.auth.dto.AuthResponse;
import com.freelancehub.freelancehub.auth.dto.LoginRequest;
import com.freelancehub.freelancehub.auth.dto.LoginResult;
import com.freelancehub.freelancehub.auth.dto.RegisterClientRequest;
import com.freelancehub.freelancehub.auth.dto.RegisterFreelancerRequest;
import com.freelancehub.freelancehub.auth.repository.EmailVerificationTokenRepository;
import com.freelancehub.freelancehub.auth.repository.PasswordResetTokenRepository;
import com.freelancehub.freelancehub.auth.service.AuthService;
import com.freelancehub.freelancehub.exception.ConflictException;
import com.freelancehub.freelancehub.integration.BaseIntegrationTest;
import com.freelancehub.freelancehub.user.domain.Role;
import com.freelancehub.freelancehub.user.domain.User;
import com.freelancehub.freelancehub.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AuthFlowIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private AuthController authController;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailVerificationTokenRepository emailVerificationTokenRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Test
    @Transactional
    void registerVerifyLoginLogoutCycle_persistsUserAuthenticatesAndClearsSessionCookies() {
        String email = uniqueEmail("client-cycle");

        LoginResult registered = authService.registerClient(clientRequest(email, "password123"));

        assertThat(registered.token()).isNotBlank();
        assertThat(registered.user().email()).isEqualTo(email);
        assertThat(registered.user().role()).isEqualTo("CLIENT");
        assertThat(registered.user().emailVerified()).isFalse();

        User persisted = userRepository.findByEmail(email).orElseThrow();
        assertThat(persisted.getRole()).isEqualTo(Role.CLIENT);
        assertThat(persisted.isEmailVerified()).isFalse();
        assertThat(persisted.getPassword()).isNotEqualTo("password123");

        EmailVerificationToken verificationToken = emailVerificationTokenRepository.findAll().stream()
                .filter(token -> token.getEmail().equals(email))
                .findFirst()
                .orElseThrow();
        authService.verifyEmail(verificationToken.getToken());

        LoginResult loggedIn = authService.login(new LoginRequest(email, "password123"));
        assertThat(loggedIn.token()).isNotBlank();
        assertThat(loggedIn.user().emailVerified()).isTrue();

        ResponseEntity<Void> logout = authController.logout();
        List<String> cookies = logout.getHeaders().get(HttpHeaders.SET_COOKIE);
        assertThat(logout.getStatusCode().value()).isEqualTo(200);
        assertThat(cookies).anySatisfy(cookie -> assertThat(cookie).contains("jwt=").contains("Max-Age=0"));
        assertThat(cookies).anySatisfy(cookie -> assertThat(cookie).contains("has_session=").contains("Max-Age=0"));
        assertThat(cookies).anySatisfy(cookie -> assertThat(cookie).contains("user_role=").contains("Max-Age=0"));
        assertThat(userRepository.findByEmail(email)).isPresent();
    }

    @Test
    @Transactional
    void registerClient_whenEmailAlreadyExists_throwsConflictFromUniqueConstraint() {
        String email = uniqueEmail("duplicate-client");
        authService.registerClient(clientRequest(email, "password123"));

        assertThatThrownBy(() -> authService.registerClient(clientRequest(email, "password123")))
                .isInstanceOf(ConflictException.class)
                .hasMessage("Email already registered");

        assertThat(userRepository.findByEmail(email)).isPresent();
    }

    @Test
    @Transactional
    void emailVerificationTokenFlow_marksUserVerifiedAndPreventsTokenReuse() {
        String email = uniqueEmail("verify-freelancer");
        authService.registerFreelancer(freelancerRequest(email, "password123"));
        User user = userRepository.findByEmail(email).orElseThrow();
        assertThat(user.isEmailVerified()).isFalse();

        EmailVerificationToken token = emailVerificationTokenRepository.findAll().stream()
                .filter(candidate -> candidate.getEmail().equals(email))
                .findFirst()
                .orElseThrow();

        authService.verifyEmail(token.getToken());

        assertThat(userRepository.findByEmail(email).orElseThrow().isEmailVerified()).isTrue();
        assertThat(emailVerificationTokenRepository.findById(token.getToken()).orElseThrow().isUsed()).isTrue();
        assertThatThrownBy(() -> authService.verifyEmail(token.getToken()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid or expired verification link");
    }

    @Test
    @Transactional
    void passwordResetTokenFlow_changesPasswordAndPreventsTokenReuse() {
        String email = uniqueEmail("reset-client");
        authService.registerClient(clientRequest(email, "oldPassword123"));
        EmailVerificationToken verificationToken = emailVerificationTokenRepository.findAll().stream()
                .filter(candidate -> candidate.getEmail().equals(email))
                .findFirst()
                .orElseThrow();
        authService.verifyEmail(verificationToken.getToken());

        authService.forgotPassword(email);

        PasswordResetToken resetToken = passwordResetTokenRepository.findAll().stream()
                .filter(candidate -> candidate.getEmail().equals(email))
                .findFirst()
                .orElseThrow();

        authService.resetPassword(resetToken.getToken(), "newPassword123");

        assertThat(passwordResetTokenRepository.findById(resetToken.getToken()).orElseThrow().isUsed()).isTrue();
        AuthResponse loggedIn = authService.login(new LoginRequest(email, "newPassword123")).user();
        assertThat(loggedIn.email()).isEqualTo(email);
        assertThat(loggedIn.emailVerified()).isTrue();
        assertThatThrownBy(() -> authService.login(new LoginRequest(email, "oldPassword123")))
                .isInstanceOf(BadCredentialsException.class);
        assertThatThrownBy(() -> authService.resetPassword(resetToken.getToken(), "anotherPassword123"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid or expired reset token");
    }

    private RegisterClientRequest clientRequest(String email, String password) {
        return new RegisterClientRequest(
                "Integration Client",
                email,
                password,
                "555-0100",
                "Integration Co",
                "Integration test company",
                "https://example.com"
        );
    }

    private RegisterFreelancerRequest freelancerRequest(String email, String password) {
        return new RegisterFreelancerRequest(
                "Integration Freelancer",
                email,
                password,
                "555-0200"
        );
    }

    private String uniqueEmail(String prefix) {
        return prefix + "-" + System.nanoTime() + "@integration.test";
    }
}
