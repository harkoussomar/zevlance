package com.freelancehub.freelancehub.user.service;

import com.freelancehub.freelancehub.exception.NotFoundException;
import com.freelancehub.freelancehub.exception.UnauthorizedException;
import com.freelancehub.freelancehub.user.domain.Client;
import com.freelancehub.freelancehub.user.domain.Freelancer;
import com.freelancehub.freelancehub.user.domain.User;
import com.freelancehub.freelancehub.user.dto.*;
import com.freelancehub.freelancehub.user.repository.ClientRepository;
import com.freelancehub.freelancehub.user.repository.FreelancerRepository;
import com.freelancehub.freelancehub.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ClientRepository clientRepository;
    private final FreelancerRepository freelancerRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // ─── Client ───────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public ClientProfileResponse getClientProfile(String clientId) {
        assertCurrentUser(clientId);
        Client client = requireClient(clientId);
        return toClientResponse(client);
    }

    @Transactional
    public ClientProfileResponse updateClientProfile(String clientId, UpdateClientProfileRequest req) {
        assertCurrentUser(clientId);
        Client client = requireClient(clientId);

        if (req.name() != null && !req.name().isBlank()) {
            client.setName(req.name().strip());
        }
        if (req.profilePicture() != null) {
            client.setProfilePicture(req.profilePicture().isBlank() ? null : req.profilePicture().strip());
        }
        if (req.companyName() != null) {
            client.setCompanyName(req.companyName().isBlank() ? null : req.companyName().strip());
        }
        if (req.companyDescription() != null) {
            client.setCompanyDescription(req.companyDescription().isBlank() ? null : req.companyDescription().strip());
        }
        if (req.website() != null) {
            client.setWebsite(req.website().isBlank() ? null : req.website().strip());
        }

        return toClientResponse(client);
    }

    // ─── Freelancer ───────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public FreelancerProfileResponse getFreelancerProfile(String freelancerId) {
        // No assertCurrentUser here so public profiles can be viewed
        Freelancer freelancer = requireFreelancer(freelancerId);
        return toFreelancerResponse(freelancer);
    }

    @Transactional
    public FreelancerProfileResponse updateFreelancerProfile(String freelancerId, UpdateFreelancerProfileRequest req) {
        assertCurrentUser(freelancerId);
        Freelancer freelancer = requireFreelancer(freelancerId);

        if (req.name() != null && !req.name().isBlank()) {
            freelancer.setName(req.name().strip());
        }
        if (req.profilePicture() != null) {
            freelancer.setProfilePicture(req.profilePicture().isBlank() ? null : req.profilePicture().strip());
        }
        if (req.bio() != null) {
            freelancer.setBio(req.bio().isBlank() ? null : req.bio().strip());
        }
        if (req.hourlyRate() != null) {
            freelancer.setHourlyRate(req.hourlyRate());
        }
        if (req.skills() != null) {
            List<String> sanitised = req.skills().stream()
                    .map(String::strip)
                    .filter(s -> !s.isBlank())
                    .distinct()
                    .toList();
            freelancer.setSkills(sanitised);
        }

        return toFreelancerResponse(freelancer);
    }

    // ─── Password change (both roles) ─────────────────────────────────────────

    @Transactional
    public void changePassword(String userId, UpdatePasswordRequest req) {
        assertCurrentUser(userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userId));

        if (!passwordEncoder.matches(req.currentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        if (req.currentPassword().equals(req.newPassword())) {
            throw new IllegalArgumentException("New password must differ from current password");
        }

        user.setPassword(passwordEncoder.encode(req.newPassword()));
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private void assertCurrentUser(String targetUserId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new UnauthorizedException("User not authenticated");
        }
        if (auth.getPrincipal() instanceof User currentUser) {
            if (!currentUser.getId().equals(targetUserId)) {
                throw new UnauthorizedException("You are not authorized to modify this profile");
            }
        }
    }

    private Client requireClient(String id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Client not found: " + id));
    }

    private Freelancer requireFreelancer(String id) {
        return freelancerRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Freelancer not found: " + id));
    }

    // ─── Mappers ──────────────────────────────────────────────────────────────

    private ClientProfileResponse toClientResponse(Client client) {
        return new ClientProfileResponse(
                client.getId(),
                client.getName(),
                client.getEmail(),
                client.getRole().name(),
                client.getProfilePicture(),
                client.getCompanyName(),
                client.getCompanyDescription(),
                client.getWebsite(),
                client.getRating(),
                0L
        );
    }

    private FreelancerProfileResponse toFreelancerResponse(Freelancer freelancer) {
        return new FreelancerProfileResponse(
                freelancer.getId(),
                freelancer.getName(),
                freelancer.getEmail(),
                freelancer.getRole().name(),
                freelancer.getProfilePicture(),
                freelancer.getBio(),
                freelancer.getHourlyRate(),
                freelancer.getRating(),
                freelancer.getSkills(),
                0L
        );
    }
}