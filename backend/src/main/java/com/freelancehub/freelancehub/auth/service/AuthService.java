package com.freelancehub.freelancehub.auth.service;

import com.freelancehub.freelancehub.auth.domain.EmailVerificationToken;
import com.freelancehub.freelancehub.auth.domain.PasswordResetToken;
import com.freelancehub.freelancehub.auth.dto.*;
import com.freelancehub.freelancehub.auth.repository.EmailVerificationTokenRepository;
import com.freelancehub.freelancehub.auth.repository.PasswordResetTokenRepository;
import com.freelancehub.freelancehub.exception.ConflictException;
import com.freelancehub.freelancehub.exception.NotFoundException;
import com.freelancehub.freelancehub.notification.service.EmailTemplates;
import com.freelancehub.freelancehub.notification.service.NotificationService;
import com.freelancehub.freelancehub.security.JwtService;
import com.freelancehub.freelancehub.user.domain.Client;
import com.freelancehub.freelancehub.user.domain.Freelancer;
import com.freelancehub.freelancehub.user.domain.User;
import com.freelancehub.freelancehub.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final NotificationService notificationService;

    private final UserRepository userRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    @Value("${app.frontend-url}")
    private String frontendUrl;


    @Transactional
    public LoginResult registerFreelancer(RegisterFreelancerRequest request) {
        Freelancer freelancer = new Freelancer();
        freelancer.setName(request.name());
        freelancer.setEmail(request.email());
        freelancer.setPassword(passwordEncoder.encode(request.password()));
        freelancer.setPhone(request.phone());

        try {
            userRepository.saveAndFlush(freelancer);
        } catch (DataIntegrityViolationException e) {
            throw new ConflictException("Email already registered");
        }

        sendVerificationEmail(freelancer.getEmail(), freelancer.getName());

        notificationService.sendEmailOnly(
                freelancer.getEmail(),
                "Welcome to FreelanceHub!",
                EmailTemplates.welcome(freelancer.getName())
        );
        return buildLoginResult(freelancer);
    }

    @Transactional
    public LoginResult registerClient(RegisterClientRequest request) {
        Client client = new Client();
        client.setName(request.name());
        client.setEmail(request.email());
        client.setPassword(passwordEncoder.encode(request.password()));
        client.setPhone(request.phone());
        client.setCompanyName(request.companyName());
        client.setCompanyDescription(request.companyDescription());
        client.setWebsite(request.website());

        try {
            userRepository.saveAndFlush(client);
        } catch (DataIntegrityViolationException e) {
            throw new ConflictException("Email already registered");
        }

        sendVerificationEmail(client.getEmail(), client.getName());

        notificationService.sendEmailOnly(
                client.getEmail(),
                "Welcome to FreelanceHub!",
                EmailTemplates.welcome(client.getName())
        );

        return buildLoginResult(client);
    }

    public LoginResult login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = (User) auth.getPrincipal();
        return buildLoginResult(user);
    }

    @Transactional
    public void forgotPassword(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            passwordResetTokenRepository.deleteByEmail(email);
            String token = UUID.randomUUID().toString();
            passwordResetTokenRepository.save(new PasswordResetToken(token, email));

            String resetUrl = frontendUrl + "/reset-password?token=" + token;
            notificationService.sendEmailOnly(
                    email,
                    "Reset your FreelanceHub password",
                    EmailTemplates.passwordReset(user.getName(), resetUrl)
            );
        });
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository
                .findByTokenAndUsedFalse(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token"));

        if (resetToken.isExpired()) {
            throw new IllegalArgumentException("Reset token has expired. Please request a new one.");
        }

        User user = userRepository.findByEmail(resetToken.getEmail())
                .orElseThrow(() -> new NotFoundException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        resetToken.setUsed(true);
    }

    @Transactional
    public void verifyEmail(String token) {
        EmailVerificationToken vToken = emailVerificationTokenRepository
                .findByTokenAndUsedFalse(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired verification link"));

        if (vToken.isExpired()) {
            throw new IllegalArgumentException("Verification link expired. Please request a new one.");
        }

        User user = userRepository.findByEmail(vToken.getEmail())
                .orElseThrow(() -> new NotFoundException("User not found"));

        user.setEmailVerified(true);
        vToken.setUsed(true);
    }

    @Transactional
    public void resendVerification(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            if (!user.isEmailVerified()) {
                sendVerificationEmail(email, user.getName());
            }
        });
    }

    private LoginResult buildLoginResult(User user) {
        String token = jwtService.generateToken(user);

        AuthResponse response = new AuthResponse(
                user.getEmail(), user.getRole().name(),
                user.getId(), user.getName(),
                user.isEmailVerified()
        );

        return new LoginResult(token, response);
    }

    private void sendVerificationEmail(String email, String name) {
        emailVerificationTokenRepository.deleteByEmail(email);
        String token = UUID.randomUUID().toString();
        emailVerificationTokenRepository.save(new EmailVerificationToken(token, email));

        String verifyUrl = frontendUrl + "/verify-email?token=" + token;
        notificationService.sendEmailOnly(
                email,
                "Verify your FreelanceHub email",
                EmailTemplates.emailVerification(name, verifyUrl)
        );
    }
}