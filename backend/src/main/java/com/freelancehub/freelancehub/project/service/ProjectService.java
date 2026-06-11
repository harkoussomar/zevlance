package com.freelancehub.freelancehub.project.service;

import com.freelancehub.freelancehub.exception.NotFoundException;
import com.freelancehub.freelancehub.exception.UnauthorizedException;
import com.freelancehub.freelancehub.project.domain.Project;
import com.freelancehub.freelancehub.project.domain.ProjectStatus;
import com.freelancehub.freelancehub.project.dto.*;
import com.freelancehub.freelancehub.project.repository.ProjectRepository;
import com.freelancehub.freelancehub.user.domain.Client;
import com.freelancehub.freelancehub.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public Page<ProjectSummaryResponse> getProjects(ProjectFilter filter, Pageable pageable) {
        return projectRepository.findWithFilters(
                filter.category() != null ? filter.category().name() : null,
                filter.status() != null ? filter.status().name() : null,
                filter.budgetMin(),
                filter.budgetMax(),
                filter.skill(),
                filter.query(),
                pageable
        ).map(this::toSummary);
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProject(String projectId) {
        Project project = findProjectById(projectId);
        return toResponse(project);
    }

    @Transactional(readOnly = true)
    public Page<ProjectSummaryResponse> getMyProjects(String clientId, Pageable pageable) {
        return projectRepository.findByClientId(clientId, pageable)
                .map(this::toSummary);
    }

    @Transactional
    public ProjectResponse createProject(CreateProjectRequest request, String clientId) {
        if (request.budgetMin().compareTo(request.budgetMax()) > 0) {
            throw new IllegalArgumentException("Budget min cannot be greater than budget max");
        }

        Client client = userService.findClientById(clientId);

        Project project = new Project();
        project.setTitle(request.title());
        project.setDescription(request.description());
        project.setBudgetMin(request.budgetMin());
        project.setBudgetMax(request.budgetMax());
        project.setCategory(request.category());
        project.setRequiredSkills(request.requiredSkills() != null ? request.requiredSkills() : java.util.List.of());
        project.setDeadline(request.deadline());
        project.setClient(client);

        projectRepository.save(project);
        return toResponse(project);
    }

    @Transactional
    public ProjectResponse updateProject(String projectId, UpdateProjectRequest request, String clientId) {

        Project project = findProjectById(projectId);
        assertOwner(project, clientId);
        assertEditable(project);

        if (request.title() != null)         project.setTitle(request.title());
        if (request.description() != null)   project.setDescription(request.description());
        if (request.budgetMin() != null)     project.setBudgetMin(request.budgetMin());
        if (request.budgetMax() != null)     project.setBudgetMax(request.budgetMax());
        if (request.category() != null)      project.setCategory(request.category());
        if (request.requiredSkills() != null) project.setRequiredSkills(request.requiredSkills());
        if (request.deadline() != null)      project.setDeadline(request.deadline());

        return toResponse(project);
    }

    @Transactional
    public void cancelProject(String projectId, String clientId) {
        Project project = findProjectById(projectId);
        assertOwner(project, clientId);

        if (project.getStatus() == ProjectStatus.COMPLETED) {
            throw new IllegalStateException("Cannot cancel a completed project");
        }
        if (project.getStatus() == ProjectStatus.CANCELLED) {
            throw new IllegalStateException("Project is already cancelled");
        }

        project.setStatus(ProjectStatus.CANCELLED);
    }

    public Project findProjectById(String id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Project not found: " + id));
    }

    private void assertOwner(Project project, String clientId) {
        if (!project.getClient().getId().equals(clientId)) {
            throw new UnauthorizedException("You do not own this project");
        }
    }

    private void assertEditable(Project project) {
        if (project.getStatus() != ProjectStatus.OPEN) {
            throw new IllegalStateException("Only OPEN projects can be edited");
        }
    }

    public ProjectSummaryResponse toSummary(Project p) {
        return new ProjectSummaryResponse(
                p.getId(),
                p.getTitle(),
                p.getBudgetMin(),
                p.getBudgetMax(),
                p.getStatus(),
                p.getCategory(),
                p.getRequiredSkills(),
                p.getDeadline(),
                p.getClient().getId(),
                p.getClient().getName(),
                p.getBids().size(),
                p.isFlagged(),
                p.isFeatured(),
                p.getCreatedAt(),
                p.getUpdatedAt()
        );
    }

    private ProjectResponse toResponse(Project p) {
        Client client = p.getClient();
        return new ProjectResponse(
                p.getId(),
                p.getTitle(),
                p.getDescription(),
                p.getBudgetMin(),
                p.getBudgetMax(),
                p.getStatus(),
                p.getCategory(),
                p.getRequiredSkills(),
                p.getDeadline(),
                client.getId(),
                client.getName(),
                client.getCompanyName(),
                p.getBids().size(),
                p.getCreatedAt()
        );
    }

    @Transactional
    public void adminDeleteProject(String projectId, String reason) {
        Project project = findProjectById(projectId);
        project.setDeletedAt(java.time.LocalDateTime.now());
    }
}