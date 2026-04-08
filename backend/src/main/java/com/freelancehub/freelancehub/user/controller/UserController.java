package com.freelancehub.freelancehub.user.controller;

import com.freelancehub.freelancehub.user.domain.User;
import com.freelancehub.freelancehub.user.dto.*;
import com.freelancehub.freelancehub.user.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * User-facing profile endpoints.
 *
 * Route summary:
 *
 *   GET  /api/v1/users/me/client-profile      → own client profile
 *   GET  /api/v1/users/me/freelancer-profile  → own freelancer profile
 *   PATCH /api/v1/users/me/client-profile     → update client profile fields
 *   PATCH /api/v1/users/me/freelancer-profile → update freelancer profile fields
 *   GET  /api/v1/freelancers/{id}             → public freelancer profile (no auth)
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class UserController {

    private final ProfileService profileService;

    // ─── Own profile reads ────────────────────────────────────────────────────

    @GetMapping("/users/me")
    public ResponseEntity<BasicProfileResponse> getMyBasicProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        return ResponseEntity.ok(new BasicProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getProfilePicture()
        ));
    }

    @GetMapping("/users/me/client-profile")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ClientProfileResponse> getMyClientProfile(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = (User) userDetails;
        return ResponseEntity.ok(profileService.getClientProfile(user.getId()));
    }

    @GetMapping("/users/me/freelancer-profile")
    @PreAuthorize("hasRole('FREELANCER')")
    public ResponseEntity<FreelancerProfileResponse> getMyFreelancerProfile(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = (User) userDetails;
        return ResponseEntity.ok(profileService.getFreelancerProfile(user.getId()));
    }

    // ─── Profile updates ──────────────────────────────────────────────────────

    /**
     * PATCH /api/v1/users/me/client-profile
     * Partial update — only non-null fields are applied.
     * Credentials (email, password) cannot be changed here.
     */
    @PatchMapping("/users/me/client-profile")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ClientProfileResponse> updateClientProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateClientProfileRequest request) {

        User user = (User) userDetails;
        return ResponseEntity.ok(profileService.updateClientProfile(user.getId(), request));
    }

    // ─── Password change ──────────────────────────────────────────────────────

    /**
     * PATCH /api/v1/users/me/password
     *
     * Available to both CLIENT and FREELANCER.
     * Returns 204 No Content on success.
     * Returns 400 Bad Request if current password is wrong or new == current.
     */
    @PatchMapping("/users/me/password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdatePasswordRequest request) {

        User user = (User) userDetails;
        profileService.changePassword(user.getId(), request);
        return ResponseEntity.noContent().build();
    }


    /**
     * PATCH /api/v1/users/me/freelancer-profile
     * Partial update — only non-null fields are applied.
     * profilePicture should already be uploaded to Cloudinary; pass the final URL.
     */
    @PatchMapping("/users/me/freelancer-profile")
    @PreAuthorize("hasRole('FREELANCER')")
    public ResponseEntity<FreelancerProfileResponse> updateFreelancerProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateFreelancerProfileRequest request) {

        User user = (User) userDetails;
        return ResponseEntity.ok(profileService.updateFreelancerProfile(user.getId(), request));
    }

    // ─── Public freelancer profile ────────────────────────────────────────────

    /**
     * GET /api/v1/freelancers/{id}
     * Public — no authentication required.
     * Ensure SecurityConfig has .requestMatchers("/api/v1/freelancers/**").permitAll()
     */
    @GetMapping("/freelancers/{id}")
    public ResponseEntity<FreelancerProfileResponse> getPublicFreelancerProfile(
            @PathVariable String id) {

        return ResponseEntity.ok(profileService.getFreelancerProfile(id));
    }
}