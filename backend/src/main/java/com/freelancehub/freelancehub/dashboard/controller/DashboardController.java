package com.freelancehub.freelancehub.dashboard.controller;

import com.freelancehub.freelancehub.dashboard.dto.ClientDashboardResponse;
import com.freelancehub.freelancehub.dashboard.dto.FreelancerDashboardResponse;
import com.freelancehub.freelancehub.dashboard.service.DashboardService;
import com.freelancehub.freelancehub.user.domain.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/freelancer")
    @PreAuthorize("hasRole('FREELANCER')")
    public ResponseEntity<FreelancerDashboardResponse> getFreelancerDashboard(
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(
                dashboardService.getFreelancerDashboard(currentUser.getId())
        );
    }

    @GetMapping("/client")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ClientDashboardResponse> getClientDashboard(
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(
                dashboardService.getClientDashboard(currentUser.getId())
        );
    }
}