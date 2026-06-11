package com.freelancehub.freelancehub.project.service;

import com.freelancehub.freelancehub.bid.domain.Bid;
import com.freelancehub.freelancehub.exception.NotFoundException;
import com.freelancehub.freelancehub.exception.UnauthorizedException;
import com.freelancehub.freelancehub.project.domain.Project;
import com.freelancehub.freelancehub.project.domain.ProjectCategory;
import com.freelancehub.freelancehub.project.domain.ProjectStatus;
import com.freelancehub.freelancehub.project.dto.CreateProjectRequest;
import com.freelancehub.freelancehub.project.dto.ProjectFilter;
import com.freelancehub.freelancehub.project.dto.ProjectResponse;
import com.freelancehub.freelancehub.project.dto.ProjectSummaryResponse;
import com.freelancehub.freelancehub.project.dto.UpdateProjectRequest;
import com.freelancehub.freelancehub.project.repository.ProjectRepository;
import com.freelancehub.freelancehub.user.domain.Client;
import com.freelancehub.freelancehub.user.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private UserService userService;

    private ProjectService projectService;

    @BeforeEach
    void setUp() {
        projectService = new ProjectService(projectRepository, userService);
    }

    @Test
    void getProjects_whenFilterProvided_passesEnumNamesToRepositoryAndMapsSummaries() {
        Project project = project("project-1", "client-1", ProjectStatus.OPEN);
        project.getBids().add(new Bid());
        ProjectFilter filter = new ProjectFilter(
                ProjectCategory.WEB_DEV,
                ProjectStatus.OPEN,
                new BigDecimal("100.00"),
                new BigDecimal("1000.00"),
                "Java",
                "marketplace"
        );
        when(projectRepository.findWithFilters(
                "WEB_DEV",
                "OPEN",
                new BigDecimal("100.00"),
                new BigDecimal("1000.00"),
                "Java",
                "marketplace",
                PageRequest.of(0, 10)
        )).thenReturn(new PageImpl<>(List.of(project)));

        Page<ProjectSummaryResponse> response = projectService.getProjects(filter, PageRequest.of(0, 10));

        assertThat(response.getTotalElements()).isEqualTo(1);
        ProjectSummaryResponse summary = response.getContent().getFirst();
        assertThat(summary.id()).isEqualTo("project-1");
        assertThat(summary.status()).isEqualTo(ProjectStatus.OPEN);
        assertThat(summary.category()).isEqualTo(ProjectCategory.WEB_DEV);
        assertThat(summary.bidCount()).isEqualTo(1);
        assertThat(summary.budgetMin()).isEqualByComparingTo("100.00");
    }

    @Test
    void getProjects_whenFilterValuesAreNull_passesNullsToRepository() {
        when(projectRepository.findWithFilters(null, null, null, null, null, null, PageRequest.of(0, 10)))
                .thenReturn(Page.empty());

        Page<ProjectSummaryResponse> response = projectService.getProjects(
                new ProjectFilter(null, null, null, null, null, null),
                PageRequest.of(0, 10)
        );

        assertThat(response).isEmpty();
        verify(projectRepository).findWithFilters(null, null, null, null, null, null, PageRequest.of(0, 10));
    }

    @Test
    void getProject_whenProjectExists_returnsDetailResponse() {
        Project project = project("project-1", "client-1", ProjectStatus.OPEN);
        project.getClient().setCompanyName("Acme");
        project.getBids().add(new Bid());
        when(projectRepository.findById("project-1")).thenReturn(Optional.of(project));

        ProjectResponse response = projectService.getProject("project-1");

        assertThat(response.id()).isEqualTo("project-1");
        assertThat(response.clientId()).isEqualTo("client-1");
        assertThat(response.clientCompany()).isEqualTo("Acme");
        assertThat(response.bidCount()).isEqualTo(1);
        assertThat(response.budgetMax()).isEqualByComparingTo("1000.00");
    }

    @Test
    void findProjectById_whenProjectDoesNotExist_throwsNotFound() {
        when(projectRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> projectService.findProjectById("missing"))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Project not found: missing");
    }

    @Test
    void getMyProjects_returnsOnlyProjectsForClient() {
        Project project = project("project-1", "client-1", ProjectStatus.OPEN);
        when(projectRepository.findByClientId("client-1", PageRequest.of(0, 10)))
                .thenReturn(new PageImpl<>(List.of(project)));

        Page<ProjectSummaryResponse> response = projectService.getMyProjects("client-1", PageRequest.of(0, 10));

        assertThat(response.getTotalElements()).isEqualTo(1);
        assertThat(response.getContent().getFirst().clientId()).isEqualTo("client-1");
    }

    @Test
    void createProject_whenBudgetRangeIsValid_savesOpenProjectForClient() {
        Client client = client("client-1");
        when(userService.findClientById("client-1")).thenReturn(client);
        CreateProjectRequest request = createRequest("100.00", "1000.00", List.of("Java", "React"));

        ProjectResponse response = projectService.createProject(request, "client-1");

        ArgumentCaptor<Project> captor = ArgumentCaptor.forClass(Project.class);
        verify(projectRepository).save(captor.capture());
        Project saved = captor.getValue();
        assertThat(saved.getClient()).isSameAs(client);
        assertThat(saved.getTitle()).isEqualTo("Project One");
        assertThat(saved.getBudgetMin()).isEqualByComparingTo("100.00");
        assertThat(saved.getBudgetMax()).isEqualByComparingTo("1000.00");
        assertThat(saved.getCategory()).isEqualTo(ProjectCategory.WEB_DEV);
        assertThat(saved.getRequiredSkills()).containsExactly("Java", "React");
        assertThat(saved.getStatus()).isEqualTo(ProjectStatus.OPEN);
        assertThat(response.status()).isEqualTo(ProjectStatus.OPEN);
    }

    @Test
    void createProject_whenSkillsAreNull_savesEmptySkillList() {
        when(userService.findClientById("client-1")).thenReturn(client("client-1"));

        projectService.createProject(createRequest("100.00", "1000.00", null), "client-1");

        ArgumentCaptor<Project> captor = ArgumentCaptor.forClass(Project.class);
        verify(projectRepository).save(captor.capture());
        assertThat(captor.getValue().getRequiredSkills()).isEmpty();
    }

    @Test
    void createProject_whenBudgetMinIsGreaterThanBudgetMax_throwsIllegalArgument() {
        assertThatThrownBy(() -> projectService.createProject(createRequest("1000.01", "1000.00", List.of()), "client-1"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Budget min cannot be greater than budget max");

        verifyNoInteractions(userService);
        verify(projectRepository, never()).save(any());
    }

    @Test
    void updateProject_whenOwnerAndProjectOpen_updatesOnlyProvidedFields() {
        Project project = project("project-1", "client-1", ProjectStatus.OPEN);
        when(projectRepository.findById("project-1")).thenReturn(Optional.of(project));
        UpdateProjectRequest request = new UpdateProjectRequest(
                "Updated title",
                null,
                new BigDecimal("150.00"),
                null,
                ProjectCategory.DATA_SCIENCE,
                List.of("Python"),
                null
        );

        ProjectResponse response = projectService.updateProject("project-1", request, "client-1");

        assertThat(project.getTitle()).isEqualTo("Updated title");
        assertThat(project.getDescription()).isEqualTo("Project description");
        assertThat(project.getBudgetMin()).isEqualByComparingTo("150.00");
        assertThat(project.getBudgetMax()).isEqualByComparingTo("1000.00");
        assertThat(project.getCategory()).isEqualTo(ProjectCategory.DATA_SCIENCE);
        assertThat(project.getRequiredSkills()).containsExactly("Python");
        assertThat(response.title()).isEqualTo("Updated title");
    }

    @Test
    void updateProject_whenCallerIsNotOwner_throwsUnauthorized() {
        when(projectRepository.findById("project-1")).thenReturn(Optional.of(project("project-1", "client-1", ProjectStatus.OPEN)));

        assertThatThrownBy(() -> projectService.updateProject("project-1", emptyUpdate(), "client-2"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("You do not own this project");
    }

    @Test
    void updateProject_whenProjectIsNotOpen_throwsIllegalState() {
        when(projectRepository.findById("project-1"))
                .thenReturn(Optional.of(project("project-1", "client-1", ProjectStatus.IN_PROGRESS)));

        assertThatThrownBy(() -> projectService.updateProject("project-1", emptyUpdate(), "client-1"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Only OPEN projects can be edited");
    }

    @Test
    void cancelProject_whenOwnerCancelsOpenProject_marksCancelled() {
        Project project = project("project-1", "client-1", ProjectStatus.OPEN);
        when(projectRepository.findById("project-1")).thenReturn(Optional.of(project));

        projectService.cancelProject("project-1", "client-1");

        assertThat(project.getStatus()).isEqualTo(ProjectStatus.CANCELLED);
    }

    @Test
    void cancelProject_whenCallerIsNotOwner_throwsUnauthorized() {
        when(projectRepository.findById("project-1")).thenReturn(Optional.of(project("project-1", "client-1", ProjectStatus.OPEN)));

        assertThatThrownBy(() -> projectService.cancelProject("project-1", "client-2"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessage("You do not own this project");
    }

    @Test
    void cancelProject_whenProjectIsCompleted_throwsIllegalState() {
        Project project = project("project-1", "client-1", ProjectStatus.COMPLETED);
        when(projectRepository.findById("project-1")).thenReturn(Optional.of(project));

        assertThatThrownBy(() -> projectService.cancelProject("project-1", "client-1"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Cannot cancel a completed project");

        assertThat(project.getStatus()).isEqualTo(ProjectStatus.COMPLETED);
    }

    @Test
    void cancelProject_whenProjectIsAlreadyCancelled_throwsIllegalState() {
        Project project = project("project-1", "client-1", ProjectStatus.CANCELLED);
        when(projectRepository.findById("project-1")).thenReturn(Optional.of(project));

        assertThatThrownBy(() -> projectService.cancelProject("project-1", "client-1"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Project is already cancelled");

        assertThat(project.getStatus()).isEqualTo(ProjectStatus.CANCELLED);
    }

    @Test
    void adminDeleteProject_marksProjectDeleted() {
        Project project = project("project-1", "client-1", ProjectStatus.OPEN);
        when(projectRepository.findById("project-1")).thenReturn(Optional.of(project));

        projectService.adminDeleteProject("project-1", "policy violation");

        assertThat(project.getDeletedAt()).isNotNull();
    }

    private CreateProjectRequest createRequest(String budgetMin, String budgetMax, List<String> skills) {
        return new CreateProjectRequest(
                "Project One",
                "Project description",
                new BigDecimal(budgetMin),
                new BigDecimal(budgetMax),
                ProjectCategory.WEB_DEV,
                skills,
                LocalDate.now().plusDays(30)
        );
    }

    private UpdateProjectRequest emptyUpdate() {
        return new UpdateProjectRequest(null, null, null, null, null, null, null);
    }

    private Project project(String id, String clientId, ProjectStatus status) {
        Project project = new Project();
        project.setId(id);
        project.setTitle("Project One");
        project.setDescription("Project description");
        project.setBudgetMin(new BigDecimal("100.00"));
        project.setBudgetMax(new BigDecimal("1000.00"));
        project.setStatus(status);
        project.setCategory(ProjectCategory.WEB_DEV);
        project.setRequiredSkills(List.of("Java", "React"));
        project.setDeadline(LocalDate.now().plusDays(30));
        project.setClient(client(clientId));
        return project;
    }

    private Client client(String id) {
        Client client = new Client();
        client.setId(id);
        client.setName("Client User");
        client.setEmail(id + "@example.com");
        return client;
    }
}
