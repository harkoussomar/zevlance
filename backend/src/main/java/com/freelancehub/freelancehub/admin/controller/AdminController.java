package com.freelancehub.freelancehub.admin.controller;

import com.freelancehub.freelancehub.admin.domain.AdminAuditLog;
import com.freelancehub.freelancehub.admin.dto.*;
import com.freelancehub.freelancehub.admin.service.AdminService;
import com.freelancehub.freelancehub.project.domain.ProjectCategory;
import com.freelancehub.freelancehub.project.domain.ProjectStatus;
import com.freelancehub.freelancehub.project.dto.ProjectSummaryResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Validated
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    // ── Users ──────────────────────────────────────────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<Page<UserResponse>> getAllUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(adminService.getAllUsers(role, status, search, pageable));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserDetailResponse> getUserDetail(@PathVariable String id) {
        return ResponseEntity.ok(adminService.getUserDetail(id));
    }

    @PatchMapping("/users/{id}/suspend")
    public ResponseEntity<Void> suspendUser(
            @PathVariable String id,
            @RequestBody @Valid AdminReasonRequest body
    ) {
        adminService.suspendUser(id, body.reason());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/users/{id}/activate")
    public ResponseEntity<Void> activateUser(
            @PathVariable String id,
            @RequestBody @Valid AdminReasonRequest body
    ) {
        adminService.activateUser(id, body.reason());
        return ResponseEntity.noContent().build();
    }

    // ── Projects list & detail ─────────────────────────────────────────────────

    @GetMapping("/projects")
    public ResponseEntity<Page<ProjectSummaryResponse>> getAllProjects(
            @RequestParam(required = false) ProjectStatus status,
            @RequestParam(required = false) String clientId,
            @RequestParam(required = false) ProjectCategory category,
            @RequestParam(required = false) Boolean flagged,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        AdminProjectFilter filter = new AdminProjectFilter(
                status, clientId, category, flagged, featured, startDate, endDate, search
        );
        return ResponseEntity.ok(adminService.getAllProjects(filter, pageable));
    }

    @GetMapping("/projects/{id}")
    public ResponseEntity<AdminProjectDetailResponse> getProjectDetail(@PathVariable String id) {
        return ResponseEntity.ok(adminService.getAdminProjectDetail(id));
    }

    // ── Project actions ────────────────────────────────────────────────────────

    @PatchMapping("/projects/{id}/status")
    public ResponseEntity<Void> changeProjectStatus(
            @PathVariable String id,
            @RequestBody @Valid ChangeProjectStatusRequest body
    ) {
        adminService.changeProjectStatus(id, body.status(), body.reason());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/projects/{id}/flag")
    public ResponseEntity<Void> flagProject(
            @PathVariable String id,
            @RequestBody @Valid FlagProjectRequest body
    ) {
        adminService.flagProject(id, body.flagged(), body.reason());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/projects/{id}/feature")
    public ResponseEntity<Void> featureProject(
            @PathVariable String id,
            @RequestBody @Valid FeatureProjectRequest body
    ) {
        adminService.featureProject(id, body.featured());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/projects/{id}")
    public ResponseEntity<Void> deleteProject(
            @PathVariable String id,
            @RequestBody @Valid AdminReasonRequest body
    ) {
        adminService.deleteProject(id, body.reason());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/projects/{id}/audit-log")
    public ResponseEntity<Page<AdminAuditLog>> getProjectAuditLog(
            @PathVariable String id,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(adminService.getAuditLogsForProject(id, pageable));
    }

    // ── Platform overview & audit ─────────────────────────────────────────────────

    @GetMapping("/overview")
    public ResponseEntity<PlatformStatsResponse> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    @GetMapping("/audit-log")
    public ResponseEntity<Page<AdminAuditLog>> getAuditLog(
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(adminService.getAuditLogs(pageable));
    }
}
