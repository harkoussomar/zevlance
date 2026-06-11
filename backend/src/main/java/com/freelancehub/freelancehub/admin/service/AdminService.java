package com.freelancehub.freelancehub.admin.service;

import com.freelancehub.freelancehub.admin.aspect.AdminProjectSpec;
import com.freelancehub.freelancehub.admin.domain.AdminActionType;
import com.freelancehub.freelancehub.admin.domain.AdminAuditLog;
import com.freelancehub.freelancehub.admin.dto.*;
import com.freelancehub.freelancehub.admin.repository.AdminAuditLogRepository;
import com.freelancehub.freelancehub.bid.repository.BidRepository;
import com.freelancehub.freelancehub.contract.domain.Contract;
import com.freelancehub.freelancehub.contract.domain.ContractStatus;
import com.freelancehub.freelancehub.contract.repository.ContractRepository;
import com.freelancehub.freelancehub.contract.repository.MilestoneRepository;
import com.freelancehub.freelancehub.project.domain.Project;
import com.freelancehub.freelancehub.project.domain.ProjectStatus;
import com.freelancehub.freelancehub.project.dto.ProjectSummaryResponse;
import com.freelancehub.freelancehub.project.repository.ProjectRepository;
import com.freelancehub.freelancehub.project.service.ProjectService;
import com.freelancehub.freelancehub.review.repository.ReviewRepository;
import com.freelancehub.freelancehub.user.domain.Role;
import com.freelancehub.freelancehub.user.domain.User;
import com.freelancehub.freelancehub.user.repository.ClientRepository;
import com.freelancehub.freelancehub.user.repository.FreelancerRepository;
import com.freelancehub.freelancehub.user.repository.UserRepository;
import com.freelancehub.freelancehub.user.service.UserService;
import com.freelancehub.freelancehub.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final AdminAuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final FreelancerRepository freelancerRepository;
    private final ClientRepository clientRepository;
    private final ProjectRepository projectRepository;
    private final BidRepository bidRepository;
    private final ContractRepository contractRepository;
    private final ReviewRepository reviewRepository;
    private final UserService userService;
    private final ProjectService projectService;
    private final MilestoneRepository milestoneRepository;

    // ── User management ────────────────────────────────────────────────────────

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(String role, String status, String search, Pageable pageable) {
        Role roleEnum = parseRole(role);
        Boolean activeFilter = null;
        if ("active".equalsIgnoreCase(status)) activeFilter = Boolean.TRUE;
        else if ("inactive".equalsIgnoreCase(status)) activeFilter = Boolean.FALSE;
        else if (status != null && !status.isBlank()) {
            throw new IllegalArgumentException("Invalid user status filter: " + status);
        }

        return userRepository.findForAdmin(roleEnum, activeFilter, search, pageable)
                .map(user -> new UserResponse(
                        user.getId(), user.getEmail(), user.getName(),
                        user.getRole().name(), user.isActive(), user.getCreatedAt()
                ));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public UserDetailResponse getUserDetail(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userId));

        Long totalProjects = null, totalBids = null, totalContracts = null;
        Double avgRating = null;
        Long totalReviews = null;

        if (user.getRole() == Role.CLIENT) {
            totalProjects  = projectRepository.countByClientId(userId);
            totalContracts = contractRepository.countByClientId(userId);
        } else if (user.getRole() == Role.FREELANCER) {
            totalBids      = bidRepository.countByFreelancerIdAndStatus(userId, com.freelancehub.freelancehub.bid.domain.BidStatus.PENDING)
                    + bidRepository.countByFreelancerIdAndStatus(userId, com.freelancehub.freelancehub.bid.domain.BidStatus.ACCEPTED)
                    + bidRepository.countByFreelancerIdAndStatus(userId, com.freelancehub.freelancehub.bid.domain.BidStatus.REJECTED);
            totalContracts = contractRepository.countByFreelancerId(userId);
            totalProjects  = contractRepository.countByFreelancerIdAndStatus(userId, ContractStatus.COMPLETED);
            avgRating      = reviewRepository.calculateAverageRating(userId);
            totalReviews   = reviewRepository.countByRevieweeId(userId);
        }

        return new UserDetailResponse(
                user.getId(), user.getEmail(), user.getName(), user.getPhone(),
                user.getProfilePicture(), user.getRole().name(), user.isActive(),
                user.isEmailVerified(), user.getCreatedAt(), user.getUpdatedAt(),
                totalProjects, totalBids, totalContracts, avgRating, totalReviews
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void suspendUser(String userId, String reason) {
        userService.suspendUser(userId);
        writeAudit(AdminActionType.SUSPEND_USER, "User", userId, reason);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void activateUser(String userId, String reason) {
        userService.activateUser(userId);
        writeAudit(AdminActionType.ACTIVATE_USER, "User", userId, reason);
    }

    // ── Project management ─────────────────────────────────────────────────────

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public Page<ProjectSummaryResponse> getAllProjects(AdminProjectFilter filter, Pageable pageable) {
        return projectRepository
                .findAll(AdminProjectSpec.forFilter(filter), pageable)
                .map(projectService::toSummary);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public AdminProjectDetailResponse getAdminProjectDetail(String projectId) {
        Project project = projectRepository.findAdminDetailById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found: " + projectId));

        List<AdminProjectDetailResponse.BidSummary> bidSummaries = project.getBids().stream()
                .map(bid -> new AdminProjectDetailResponse.BidSummary(
                        bid.getId(),
                        bid.getFreelancer().getId(),
                        bid.getFreelancer().getName(),
                        bid.getProposedPrice(),
                        bid.getStatus().name(),
                        bid.getSubmittedAt()
                ))
                .toList();

        // Fix 3 & 4: explicit typed variable instead of inline .map() chain.
        // javac couldn't infer the generic type when the lambda returned a nested record,
        // causing "incompatible types: Object cannot be converted to ContractSummary".
        AdminProjectDetailResponse.ContractSummary contractSummary = null;
        Optional<Contract> contractOpt = contractRepository.findLatestByProjectId(projectId);
        if (contractOpt.isPresent()) {
            Contract c = contractOpt.get();
            contractSummary = new AdminProjectDetailResponse.ContractSummary(
                    c.getId(),
                    c.getStatus().name(),
                    c.getBid().getFreelancer().getId(),
                    c.getBid().getFreelancer().getName(),
                    c.getAgreedPrice(),
                    c.getStartDate()   // LocalDate — now matches ContractSummary record field type
            );
        }

        return new AdminProjectDetailResponse(
                project.getId(),
                project.getTitle(),
                project.getDescription(),
                project.getBudgetMin(),
                project.getBudgetMax(),
                project.getStatus(),
                project.getCategory(),
                project.getRequiredSkills(),
                project.getDeadline(),
                project.getClient().getId(),
                project.getClient().getName(),
                project.getClient().getEmail(),
                project.isFlagged(),
                project.isFeatured(),
                project.getAdminNote(),
                project.getBids().size(),
                bidSummaries,
                contractSummary,
                project.getCreatedAt(),
                project.getUpdatedAt()
        );
    }



    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void changeProjectStatus(String projectId, ProjectStatus newStatus, String reason) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found: " + projectId));
        ProjectStatus prev = project.getStatus();
        project.setStatus(newStatus);
        projectRepository.save(project);
        writeAudit(AdminActionType.CHANGE_PROJECT_STATUS, "Project", projectId,
                "Status changed from " + prev + " to " + newStatus + ". Reason: " + reason);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void flagProject(String projectId, boolean flagged, String reason) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found: " + projectId));
        project.setFlagged(flagged);
        projectRepository.save(project);
        writeAudit(
                flagged ? AdminActionType.FLAG_PROJECT : AdminActionType.UNFLAG_PROJECT,
                "Project", projectId, reason
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void featureProject(String projectId, boolean featured) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("Project not found: " + projectId));
        project.setFeatured(featured);
        projectRepository.save(project);
        writeAudit(
                featured ? AdminActionType.FEATURE_PROJECT : AdminActionType.UNFEATURE_PROJECT,
                "Project", projectId,
                featured ? "Featured on platform homepage." : "Removed from featured section."
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void deleteProject(String projectId, String reason) {
        projectService.adminDeleteProject(projectId, reason);
        writeAudit(AdminActionType.DELETE_PROJECT, "Project", projectId, reason);
    }

    // ── Stats & Audit ──────────────────────────────────────────────────────────

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public PlatformStatsResponse getStats() {
        // ── User counts ───────────────────────────────────────────────────────
        long totalUsers        = userRepository.count();
        long totalFreelancers  = freelancerRepository.count();
        long totalClients      = clientRepository.count();
        long suspendedUsers    = userRepository.countByActiveFalse();

        // ── Project counts ────────────────────────────────────────────────────
        long totalProjects     = projectRepository.count();
        long openProjects      = projectRepository.countByStatus(ProjectStatus.OPEN);
        long inProgress        = projectRepository.countByStatus(ProjectStatus.IN_PROGRESS);
        long completedProjects = projectRepository.countByStatus(ProjectStatus.COMPLETED);
        long flaggedProjects   = projectRepository.countByFlagged(true);
        long suspendedProjects = projectRepository.countSuspended();

        // ── Bid / contract counts ─────────────────────────────────────────────
        long totalBids          = bidRepository.count();
        long totalContracts     = contractRepository.count();
        long activeContracts    = contractRepository.countByStatus(ContractStatus.ACTIVE);
        long completedContracts = contractRepository.countByStatus(ContractStatus.COMPLETED);

        // ── Reviews ───────────────────────────────────────────────────────────
        long totalReviews = reviewRepository.count();
        Double avgRating  = reviewRepository.calculateOverallAverageRating();

        // ── Revenue ───────────────────────────────────────────────────────────
        // ⚠ Inject milestoneRepository in the constructor and add @RequiredArgsConstructor
        BigDecimal revenueVolume  = milestoneRepository.sumReleasedRevenue();
        long       pendingDisputes = milestoneRepository.countDisputed();


        // ── Revenue time series (last 30 days) ────────────────────────────────
        List<RevenueDataPoint> revenueOverTime = milestoneRepository
                .findRevenueLastNDays(30)
                .stream()
                .map(row -> new RevenueDataPoint(
                        // Corrected cast to LocalDateTime
                        ((java.time.LocalDateTime) row[0]).toLocalDate(),
                        new BigDecimal(row[1].toString())
                ))
                .toList();

        // ── User growth time series (last 30 days) ────────────────────────────
        List<UserGrowthDataPoint> userGrowthOverTime = userRepository
                .findUserGrowthLastNDays(30)
                .stream()
                .map(row -> new UserGrowthDataPoint(
                        // Corrected cast to LocalDateTime
                        ((java.time.LocalDateTime) row[0]).toLocalDate(),
                        ((Number) row[1]).longValue()
                ))
                .toList();


        return new PlatformStatsResponse(
                totalUsers,
                totalFreelancers,
                totalClients,
                suspendedUsers,
                totalProjects,
                openProjects,
                inProgress,
                completedProjects,
                flaggedProjects,
                suspendedProjects,
                totalBids,
                totalContracts,
                activeContracts,
                completedContracts,
                pendingDisputes,
                totalReviews,
                avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0,
                revenueVolume,
                revenueOverTime,
                userGrowthOverTime
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public Page<AdminAuditLog> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public Page<AdminAuditLog> getAuditLogsForProject(String projectId, Pageable pageable) {
        return auditLogRepository
                .findByTargetEntityTypeAndTargetEntityIdOrderByCreatedAtDesc("Project", projectId, pageable);
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    private void writeAudit(AdminActionType action, String entityType, String entityId, String reason) {
        String adminId = SecurityContextHolder.getContext().getAuthentication().getName();
        AdminAuditLog log = new AdminAuditLog();
        log.setAdminId(adminId);
        log.setAction(action);
        log.setTargetEntityType(entityType);
        log.setTargetEntityId(entityId);
        log.setReason(reason);
        auditLogRepository.save(log);
    }

    private Role parseRole(String role) {
        if (role == null || role.isBlank()) return null;
        try {
            return Role.valueOf(role);
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid user role filter: " + role);
        }
    }
}
