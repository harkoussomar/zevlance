package com.freelancehub.freelancehub.auth;

import com.freelancehub.freelancehub.auth.dto.*;
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

    @PostMapping("/register/freelancer")
    public ResponseEntity<AuthResponse> registerFreelancer(@Valid @RequestBody RegisterFreelancerRequest request) {
        LoginResult result = authService.registerFreelancer(request);
        return ResponseEntity.status(201)
                .header(HttpHeaders.SET_COOKIE, createJwtCookie(result.token()).toString())
                .body(result.user());
    }

    @PostMapping("/register/client")
    public ResponseEntity<AuthResponse> registerClient(@Valid @RequestBody RegisterClientRequest request) {
        LoginResult result = authService.registerClient(request);
        return ResponseEntity.status(201)
                .header(HttpHeaders.SET_COOKIE, createJwtCookie(result.token()).toString())
                .body(result.user());
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResult result = authService.login(request);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, createJwtCookie(result.token()).toString())
                .body(result.user());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        // Clear the cookie by setting maxAge to 0
        ResponseCookie cookie = ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .path("/")
                .maxAge(0)
                .build();
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).build();
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> me(@AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails; // safe — Freelancer and Client both ARE a User
        return ResponseEntity.ok(
                new AuthResponse(user.getEmail(), user.getRole().name(), user.getId())
        );
    }

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    private ResponseCookie createJwtCookie(String token) {
        return ResponseCookie.from("jwt", token)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(24 * 60 * 60)
                .sameSite("Strict")
                .build();
    }
}