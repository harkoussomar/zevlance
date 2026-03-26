package com.freelancehub.freelancehub.project.controller;

import com.freelancehub.freelancehub.project.domain.ProjectCategory;
import com.freelancehub.freelancehub.project.domain.ProjectStatus;
import com.freelancehub.freelancehub.project.dto.*;
import com.freelancehub.freelancehub.project.service.ProjectService;
import com.freelancehub.freelancehub.user.domain.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    // GET /api/v1/projects?category=WEB_DEV&budgetMin=100&page=0&size=10
    @GetMapping("/projects")
    public ResponseEntity<Page<ProjectSummaryResponse>> getProjects(
            @RequestParam(required = false) ProjectCategory category,
            @RequestParam(required = false) ProjectStatus status,
            @RequestParam(required = false) Double budgetMin,
            @RequestParam(required = false) Double budgetMax,
            @RequestParam(required = false) String skill,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable
    ) {

        ProjectFilter filter = new ProjectFilter(category, status, budgetMin, budgetMax, skill);

        return ResponseEntity.ok(projectService.getProjects(filter, pageable));
    }

    // GET /api/v1/projects/{id}
    @GetMapping("/projects/{id}")
    public ResponseEntity<ProjectResponse> getProject(@PathVariable String id) {
        return ResponseEntity.ok(projectService.getProject(id));
    }

    // GET /api/v1/projects/my  — CLIENT only
    @GetMapping("/projects/my")
    public ResponseEntity<Page<ProjectSummaryResponse>> getMyProjects(
            @AuthenticationPrincipal User currentUser,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        return ResponseEntity.ok(projectService.getMyProjects(currentUser.getId(), pageable));
    }

    // POST /api/v1/projects  — CLIENT only
    @PostMapping("/projects")
    public ResponseEntity<ProjectResponse> createProject(
            @Valid @RequestBody CreateProjectRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.status(201)
                .body(projectService.createProject(request, currentUser.getId()));
    }

    // PUT /api/v1/projects/{id}  — CLIENT owner only
    @PutMapping("/projects/{id}")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable String id,
            @Valid @RequestBody UpdateProjectRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(projectService.updateProject(id, request, currentUser.getId()));
    }

    // DELETE /api/v1/projects/{id}  — CLIENT owner only (sets status CANCELLED)
    @DeleteMapping("/projects/{id}")
    public ResponseEntity<Void> cancelProject(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser
    ) {
        projectService.cancelProject(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}