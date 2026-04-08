package com.freelancehub.freelancehub.auth.controller;

import com.freelancehub.freelancehub.auth.dto.*;
import com.freelancehub.freelancehub.auth.service.AuthService;
import com.freelancehub.freelancehub.user.domain.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    // ── Register ──────────────────────────────────────────────────────────────

    @PostMapping("/register/freelancer")
    public ResponseEntity<AuthResponse> registerFreelancer(
            @Valid @RequestBody RegisterFreelancerRequest request) {
        LoginResult result = authService.registerFreelancer(request);
        return ResponseEntity.status(201)
                .header(HttpHeaders.SET_COOKIE, createJwtCookie(result.token()).toString())
                .header(HttpHeaders.SET_COOKIE, createSessionFlagCookie(true).toString())
                .header(HttpHeaders.SET_COOKIE, createRoleCookie("FREELANCER").toString())
                .header(HttpHeaders.SET_COOKIE, createEmailVerifiedCookie(false).toString())
                .body(result.user());
    }

    @PostMapping("/register/client")
    public ResponseEntity<AuthResponse> registerClient(
            @Valid @RequestBody RegisterClientRequest request) {
        LoginResult result = authService.registerClient(request);
        return ResponseEntity.status(201)
                .header(HttpHeaders.SET_COOKIE, createJwtCookie(result.token()).toString())
                .header(HttpHeaders.SET_COOKIE, createSessionFlagCookie(true).toString())
                .header(HttpHeaders.SET_COOKIE, createRoleCookie("CLIENT").toString())
                .header(HttpHeaders.SET_COOKIE, createEmailVerifiedCookie(false).toString())
                .body(result.user());
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResult result = authService.login(request);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, createJwtCookie(result.token()).toString())
                .header(HttpHeaders.SET_COOKIE, createSessionFlagCookie(true).toString())
                .header(HttpHeaders.SET_COOKIE, createRoleCookie(result.user().role()).toString())
                .header(HttpHeaders.SET_COOKIE, createEmailVerifiedCookie(result.user().emailVerified()).toString())
                .body(result.user());
    }

    // ── Logout ────────────────────────────────────────────────────────────────

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, createJwtCookie("").toString())
                .header(HttpHeaders.SET_COOKIE, createSessionFlagCookie(false).toString())
                .header(HttpHeaders.SET_COOKIE, createRoleCookie("").toString())
                .header(HttpHeaders.SET_COOKIE, createEmailVerifiedCookie(false).toString())
                .build();
    }

    // ── Password reset ────────────────────────────────────────────────────────

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@RequestBody @Valid ForgotPasswordRequest req) {
        authService.forgotPassword(req.email());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@RequestBody @Valid ResetPasswordRequest req) {
        authService.resetPassword(req.token(), req.newPassword());
        return ResponseEntity.noContent().build();
    }

    // ── Email verification ────────────────────────────────────────────────────

    @PostMapping("/verify-email")
    public ResponseEntity<Void> verifyEmail(@RequestParam String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, createEmailVerifiedCookie(true).toString())
                .build();
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<Void> resendVerification(
            @AuthenticationPrincipal UserDetails userDetails) {
        authService.resendVerification(userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    // ── Me ────────────────────────────────────────────────────────────────────

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> me(@AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        return ResponseEntity.ok(
                new AuthResponse(
                        user.getEmail(),
                        user.getRole().name(),
                        user.getId(),
                        user.getName(),
                        user.isEmailVerified()
                )
        );
    }

    // ── Cookie builders ───────────────────────────────────────────────────────

    private ResponseCookie createJwtCookie(String token) {
        return ResponseCookie.from("jwt", token)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(token.isEmpty() ? 0 : 24 * 60 * 60)
                .sameSite("Lax")
                .build();
    }

    private ResponseCookie createSessionFlagCookie(boolean active) {
        return ResponseCookie.from("has_session", active ? "true" : "")
                .httpOnly(false)
                .secure(cookieSecure)
                .path("/")
                .maxAge(active ? 24 * 60 * 60 : 0)
                .sameSite("Lax")
                .build();
    }

    private ResponseCookie createRoleCookie(String role) {
        return ResponseCookie.from("user_role", role)
                .httpOnly(false)
                .secure(cookieSecure)
                .path("/")
                .maxAge(role.isEmpty() ? 0 : 24 * 60 * 60)
                .sameSite("Lax")
                .build();
    }

    private ResponseCookie createEmailVerifiedCookie(boolean verified) {
        return ResponseCookie.from("email_verified", verified ? "true" : "false")
                .httpOnly(false)
                .secure(cookieSecure)
                .path("/")
                .maxAge(24 * 60 * 60)
                .sameSite("Lax")
                .build();
    }
}