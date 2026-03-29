package com.freelancehub.freelancehub.auth;

import com.freelancehub.freelancehub.auth.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@SuppressWarnings("unused")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register/freelancer")
    public ResponseEntity<AuthResponse> registerFreelancer(
            @Valid @RequestBody RegisterFreelancerRequest request
    ) {
        return ResponseEntity.status(201).body(authService.registerFreelancer(request));
    }

    @PostMapping("/register/client")
    public ResponseEntity<AuthResponse> registerClient(
            @Valid @RequestBody RegisterClientRequest request
    ) {
        return ResponseEntity.status(201).body(authService.registerClient(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        return ResponseEntity.ok(authService.login(request));
    }
}