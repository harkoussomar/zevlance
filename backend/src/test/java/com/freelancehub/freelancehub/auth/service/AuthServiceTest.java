package com.freelancehub.freelancehub.auth.service;

import com.freelancehub.freelancehub.auth.domain.EmailVerificationToken;
import com.freelancehub.freelancehub.auth.domain.PasswordResetToken;
import com.freelancehub.freelancehub.auth.dto.LoginRequest;
import com.freelancehub.freelancehub.auth.dto.LoginResult;
import com.freelancehub.freelancehub.auth.dto.RegisterClientRequest;
import com.freelancehub.freelancehub.auth.dto.RegisterFreelancerRequest;
import com.freelancehub.freelancehub.auth.repository.EmailVerificationTokenRepository;
import com.freelancehub.freelancehub.auth.repository.PasswordResetTokenRepository;
import com.freelancehub.freelancehub.exception.ConflictException;
import com.freelancehub.freelancehub.exception.NotFoundException;
import com.freelancehub.freelancehub.notification.service.NotificationService;
import com.freelancehub.freelancehub.security.JwtService;
import com.freelancehub.freelancehub.user.domain.Client;
import com.freelancehub.freelancehub.user.domain.Freelancer;
import com.freelancehub.freelancehub.user.domain.Role;
import com.freelancehub.freelancehub.user.domain.User;
import com.freelancehub.freelancehub.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private NotificationService notificationService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailVerificationTokenRepository emailVerificationTokenRepository;

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Mock
    private Authentication authentication;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                passwordEncoder,
                jwtService,
                authenticationManager,
                notificationService,
                userRepository,
                emailVerificationTokenRepository,
                passwordResetTokenRepository
        );
        setField("frontendUrl", "http://localhost:3000");
    }

    @Test
    void registerFreelancer_whenEmailIsAvailable_savesUserSendsVerificationAndWelcomeEmail() {
        when(passwordEncoder.encode("password123")).thenReturn("encoded-password");
        doAnswer(invocation -> {
            Freelancer freelancer = invocation.getArgument(0);
            freelancer.setId("freelancer-1");
            return freelancer;
        }).when(userRepository).saveAndFlush(any(Freelancer.class));
        when(jwtService.generateToken(any(User.class))).thenReturn("jwt-token");

        LoginResult result = authService.registerFreelancer(new RegisterFreelancerRequest(
                "Freelancer User",
                "freelancer@example.com",
                "password123",
                "123"
        ));

        ArgumentCaptor<Freelancer> userCaptor = ArgumentCaptor.forClass(Freelancer.class);
        verify(userRepository).saveAndFlush(userCaptor.capture());
        Freelancer saved = userCaptor.getValue();
        assertThat(saved.getId()).isEqualTo("freelancer-1");
        assertThat(saved.getName()).isEqualTo("Freelancer User");
        assertThat(saved.getEmail()).isEqualTo("freelancer@example.com");
        assertThat(saved.getPassword()).isEqualTo("encoded-password");
        assertThat(saved.getPhone()).isEqualTo("123");
        assertThat(saved.getRole()).isEqualTo(Role.FREELANCER);
        assertThat(result.token()).isEqualTo("jwt-token");
        assertThat(result.user().role()).isEqualTo("FREELANCER");
        assertThat(result.user().emailVerified()).isFalse();

        ArgumentCaptor<EmailVerificationToken> tokenCaptor = ArgumentCaptor.forClass(EmailVerificationToken.class);
        verify(emailVerificationTokenRepository).deleteByEmail("freelancer@example.com");
        verify(emailVerificationTokenRepository).save(tokenCaptor.capture());
        assertThat(tokenCaptor.getValue().getEmail()).isEqualTo("freelancer@example.com");
        assertThat(tokenCaptor.getValue().getToken()).isNotBlank();
        assertThat(tokenCaptor.getValue().isUsed()).isFalse();

        verify(notificationService).sendEmailOnly(
                eq("freelancer@example.com"),
                eq("Verify your FreelanceHub email"),
                contains("http://localhost:3000/verify-email?token=" + tokenCaptor.getValue().getToken())
        );
        verify(notificationService).sendEmailOnly(
                eq("freelancer@example.com"),
                eq("Welcome to FreelanceHub!"),
                contains("Freelancer User")
        );
    }

    @Test
    void registerClient_whenEmailIsAvailable_savesClientFieldsAndReturnsLoginResult() {
        when(passwordEncoder.encode("password123")).thenReturn("encoded-password");
        doAnswer(invocation -> {
            Client client = invocation.getArgument(0);
            client.setId("client-1");
            return client;
        }).when(userRepository).saveAndFlush(any(Client.class));
        when(jwtService.generateToken(any(User.class))).thenReturn("jwt-token");

        LoginResult result = authService.registerClient(new RegisterClientRequest(
                "Client User",
                "client@example.com",
                "password123",
                "123",
                "Acme",
                "Builds things",
                "https://example.com"
        ));

        ArgumentCaptor<Client> userCaptor = ArgumentCaptor.forClass(Client.class);
        verify(userRepository).saveAndFlush(userCaptor.capture());
        Client saved = userCaptor.getValue();
        assertThat(saved.getRole()).isEqualTo(Role.CLIENT);
        assertThat(saved.getCompanyName()).isEqualTo("Acme");
        assertThat(saved.getCompanyDescription()).isEqualTo("Builds things");
        assertThat(saved.getWebsite()).isEqualTo("https://example.com");
        assertThat(result.token()).isEqualTo("jwt-token");
        assertThat(result.user().userId()).isEqualTo("client-1");
        assertThat(result.user().role()).isEqualTo("CLIENT");
    }

    @Test
    void registerFreelancer_whenEmailAlreadyExists_throwsConflictWithoutSendingEmails() {
        when(passwordEncoder.encode("password123")).thenReturn("encoded-password");
        when(userRepository.saveAndFlush(any(Freelancer.class)))
                .thenThrow(new DataIntegrityViolationException("duplicate email"));

        assertThatThrownBy(() -> authService.registerFreelancer(new RegisterFreelancerRequest(
                "Freelancer User",
                "duplicate@example.com",
                "password123",
                null
        )))
                .isInstanceOf(ConflictException.class)
                .hasMessage("Email already registered");

        verifyNoInteractions(emailVerificationTokenRepository, notificationService, jwtService);
    }

    @Test
    void login_whenCredentialsAreValid_authenticatesAndReturnsToken() {
        Client client = client("client-1", "client@example.com", true);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(client);
        when(jwtService.generateToken(client)).thenReturn("jwt-token");

        LoginResult result = authService.login(new LoginRequest("client@example.com", "password123"));

        ArgumentCaptor<UsernamePasswordAuthenticationToken> authCaptor =
                ArgumentCaptor.forClass(UsernamePasswordAuthenticationToken.class);
        verify(authenticationManager).authenticate(authCaptor.capture());
        assertThat(authCaptor.getValue().getPrincipal()).isEqualTo("client@example.com");
        assertThat(authCaptor.getValue().getCredentials()).isEqualTo("password123");
        assertThat(result.token()).isEqualTo("jwt-token");
        assertThat(result.user().email()).isEqualTo("client@example.com");
        assertThat(result.user().emailVerified()).isTrue();
    }

    @Test
    void forgotPassword_whenEmailExists_replacesTokenAndSendsResetEmail() {
        Client client = client("client-1", "client@example.com", true);
        when(userRepository.findByEmail("client@example.com")).thenReturn(Optional.of(client));

        authService.forgotPassword("client@example.com");

        verify(passwordResetTokenRepository).deleteByEmail("client@example.com");
        ArgumentCaptor<PasswordResetToken> tokenCaptor = ArgumentCaptor.forClass(PasswordResetToken.class);
        verify(passwordResetTokenRepository).save(tokenCaptor.capture());
        assertThat(tokenCaptor.getValue().getEmail()).isEqualTo("client@example.com");
        assertThat(tokenCaptor.getValue().getToken()).isNotBlank();
        assertThat(tokenCaptor.getValue().isUsed()).isFalse();
        verify(notificationService).sendEmailOnly(
                eq("client@example.com"),
                eq("Reset your FreelanceHub password"),
                contains("http://localhost:3000/reset-password?token=" + tokenCaptor.getValue().getToken())
        );
    }

    @Test
    void forgotPassword_whenEmailDoesNotExist_doesNothingObservable() {
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        authService.forgotPassword("missing@example.com");

        verifyNoInteractions(passwordResetTokenRepository, notificationService);
    }

    @Test
    void resetPassword_whenTokenIsValid_updatesPasswordAndMarksTokenUsed() {
        PasswordResetToken token = new PasswordResetToken("reset-token", "client@example.com");
        Client client = client("client-1", "client@example.com", true);
        when(passwordResetTokenRepository.findByTokenAndUsedFalse("reset-token")).thenReturn(Optional.of(token));
        when(userRepository.findByEmail("client@example.com")).thenReturn(Optional.of(client));
        when(passwordEncoder.encode("newPassword123")).thenReturn("encoded-new-password");

        authService.resetPassword("reset-token", "newPassword123");

        assertThat(client.getPassword()).isEqualTo("encoded-new-password");
        assertThat(token.isUsed()).isTrue();
    }

    @Test
    void resetPassword_whenTokenDoesNotExist_throwsIllegalArgument() {
        when(passwordResetTokenRepository.findByTokenAndUsedFalse("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.resetPassword("missing", "newPassword123"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid or expired reset token");

        verifyNoInteractions(userRepository, passwordEncoder);
    }

    @Test
    void resetPassword_whenTokenIsExpired_throwsIllegalArgument() {
        PasswordResetToken token = new PasswordResetToken("reset-token", "client@example.com");
        token.setExpiresAt(LocalDateTime.now().minusSeconds(1));
        when(passwordResetTokenRepository.findByTokenAndUsedFalse("reset-token")).thenReturn(Optional.of(token));

        assertThatThrownBy(() -> authService.resetPassword("reset-token", "newPassword123"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Reset token has expired. Please request a new one.");

        assertThat(token.isUsed()).isFalse();
        verifyNoInteractions(userRepository, passwordEncoder);
    }

    @Test
    void resetPassword_whenUserIsMissing_throwsNotFound() {
        PasswordResetToken token = new PasswordResetToken("reset-token", "missing@example.com");
        when(passwordResetTokenRepository.findByTokenAndUsedFalse("reset-token")).thenReturn(Optional.of(token));
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.resetPassword("reset-token", "newPassword123"))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("User not found");
    }

    @Test
    void verifyEmail_whenTokenIsValid_marksUserVerifiedAndTokenUsed() {
        EmailVerificationToken token = new EmailVerificationToken("verify-token", "client@example.com");
        Client client = client("client-1", "client@example.com", false);
        when(emailVerificationTokenRepository.findByTokenAndUsedFalse("verify-token")).thenReturn(Optional.of(token));
        when(userRepository.findByEmail("client@example.com")).thenReturn(Optional.of(client));

        authService.verifyEmail("verify-token");

        assertThat(client.isEmailVerified()).isTrue();
        assertThat(token.isUsed()).isTrue();
    }

    @Test
    void verifyEmail_whenTokenDoesNotExist_throwsIllegalArgument() {
        when(emailVerificationTokenRepository.findByTokenAndUsedFalse("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.verifyEmail("missing"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Invalid or expired verification link");

        verifyNoInteractions(userRepository);
    }

    @Test
    void verifyEmail_whenTokenIsExpired_throwsIllegalArgument() {
        EmailVerificationToken token = new EmailVerificationToken("verify-token", "client@example.com");
        token.setExpiresAt(LocalDateTime.now().minusSeconds(1));
        when(emailVerificationTokenRepository.findByTokenAndUsedFalse("verify-token")).thenReturn(Optional.of(token));

        assertThatThrownBy(() -> authService.verifyEmail("verify-token"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Verification link expired. Please request a new one.");

        assertThat(token.isUsed()).isFalse();
        verifyNoInteractions(userRepository);
    }

    @Test
    void verifyEmail_whenUserIsMissing_throwsNotFound() {
        EmailVerificationToken token = new EmailVerificationToken("verify-token", "missing@example.com");
        when(emailVerificationTokenRepository.findByTokenAndUsedFalse("verify-token")).thenReturn(Optional.of(token));
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.verifyEmail("verify-token"))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("User not found");
    }

    @Test
    void resendVerification_whenUserExistsAndIsUnverified_sendsNewVerificationToken() {
        Client client = client("client-1", "client@example.com", false);
        when(userRepository.findByEmail("client@example.com")).thenReturn(Optional.of(client));

        authService.resendVerification("client@example.com");

        verify(emailVerificationTokenRepository).deleteByEmail("client@example.com");
        ArgumentCaptor<EmailVerificationToken> tokenCaptor = ArgumentCaptor.forClass(EmailVerificationToken.class);
        verify(emailVerificationTokenRepository).save(tokenCaptor.capture());
        verify(notificationService).sendEmailOnly(
                eq("client@example.com"),
                eq("Verify your FreelanceHub email"),
                contains("http://localhost:3000/verify-email?token=" + tokenCaptor.getValue().getToken())
        );
    }

    @Test
    void resendVerification_whenUserAlreadyVerified_doesNothing() {
        when(userRepository.findByEmail("client@example.com"))
                .thenReturn(Optional.of(client("client-1", "client@example.com", true)));

        authService.resendVerification("client@example.com");

        verifyNoInteractions(emailVerificationTokenRepository, notificationService);
    }

    @Test
    void resendVerification_whenUserDoesNotExist_doesNothing() {
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        authService.resendVerification("missing@example.com");

        verifyNoInteractions(emailVerificationTokenRepository, notificationService);
    }

    private Client client(String id, String email, boolean emailVerified) {
        Client client = new Client();
        client.setId(id);
        client.setName("Client User");
        client.setEmail(email);
        client.setPassword("encoded-password");
        client.setEmailVerified(emailVerified);
        return client;
    }

    private void setField(String name, Object value) {
        try {
            Field field = AuthService.class.getDeclaredField(name);
            field.setAccessible(true);
            field.set(authService, value);
        } catch (ReflectiveOperationException e) {
            throw new AssertionError("Failed to set field " + name, e);
        }
    }
}
