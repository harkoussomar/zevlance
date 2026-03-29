package com.freelancehub.freelancehub.admin.controller;

import com.freelancehub.freelancehub.admin.dto.PlatformStatsResponse;
import com.freelancehub.freelancehub.admin.dto.UserResponse;
import com.freelancehub.freelancehub.admin.service.AdminService;
import com.freelancehub.freelancehub.user.domain.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // GET /api/v1/admin/users
    @GetMapping("/users")
    public ResponseEntity<Page<UserResponse>> getAllUsers(
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(adminService.getAllUsers(pageable));
    }

    // PUT /api/v1/admin/users/{id}/suspend
    @PutMapping("/users/{id}/suspend")
    public ResponseEntity<Void> suspendUser(@PathVariable String id) {
        adminService.suspendUser(id);
        return ResponseEntity.noContent().build();
    }

    // PUT /api/v1/admin/users/{id}/activate
    @PutMapping("/users/{id}/activate")
    public ResponseEntity<Void> activateUser(@PathVariable String id) {
        adminService.activateUser(id);
        return ResponseEntity.noContent().build();
    }

    // DELETE /api/v1/admin/projects/{id}
    @DeleteMapping("/projects/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable String id) {
        adminService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    // GET /api/v1/admin/stats
    @GetMapping("/stats")
    public ResponseEntity<PlatformStatsResponse> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }
}