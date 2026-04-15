package com.freelancehub.freelancehub.user.controller;

import com.freelancehub.freelancehub.user.domain.User;
import com.freelancehub.freelancehub.user.dto.*;
import com.freelancehub.freelancehub.user.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class UserController {

    private final ProfileService profileService;

    // ─── Own profile reads ────────────────────────────────────────────────────

    @GetMapping("/users/me")
    public ResponseEntity<BasicProfileResponse> getMyBasicProfile(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(new BasicProfileResponse(
                currentUser.getId(),
                currentUser.getName(),
                currentUser.getEmail(),
                currentUser.getRole().name(),
                currentUser.getProfilePicture()
        ));
    }

    @GetMapping("/users/me/client-profile")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ClientProfileResponse> getMyClientProfile(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(profileService.getClientProfile(currentUser.getId()));
    }

    @GetMapping("/users/me/freelancer-profile")
    @PreAuthorize("hasRole('FREELANCER')")
    public ResponseEntity<FreelancerProfileResponse> getMyFreelancerProfile(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(profileService.getFreelancerProfile(currentUser.getId()));
    }

    // ─── Profile updates ──────────────────────────────────────────────────────

    @PatchMapping("/users/me/client-profile")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ClientProfileResponse> updateClientProfile(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody UpdateClientProfileRequest request) {
        return ResponseEntity.ok(profileService.updateClientProfile(currentUser.getId(), request));
    }

    @PatchMapping("/users/me/freelancer-profile")
    @PreAuthorize("hasRole('FREELANCER')")
    public ResponseEntity<FreelancerProfileResponse> updateFreelancerProfile(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody UpdateFreelancerProfileRequest request) {
        return ResponseEntity.ok(profileService.updateFreelancerProfile(currentUser.getId(), request));
    }

    // ─── Password change ──────────────────────────────────────────────────────

    @PatchMapping("/users/me/password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody UpdatePasswordRequest request) {
        profileService.changePassword(currentUser.getId(), request);
        return ResponseEntity.noContent().build();
    }

    // ─── Public freelancer profile ────────────────────────────────────────────

    @GetMapping("/freelancers/{id}")
    public ResponseEntity<FreelancerProfileResponse> getPublicFreelancerProfile(
            @PathVariable String id) {
        return ResponseEntity.ok(profileService.getFreelancerProfile(id));
    }
}