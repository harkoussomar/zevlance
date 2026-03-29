package com.freelancehub.freelancehub.admin.service;

import com.freelancehub.freelancehub.admin.dto.PlatformStatsResponse;
import com.freelancehub.freelancehub.admin.dto.UserResponse;
import com.freelancehub.freelancehub.bid.repository.BidRepository;
import com.freelancehub.freelancehub.contract.domain.ContractStatus;
import com.freelancehub.freelancehub.contract.repository.ContractRepository;
import com.freelancehub.freelancehub.exception.NotFoundException;
import com.freelancehub.freelancehub.project.domain.ProjectStatus;
import com.freelancehub.freelancehub.project.repository.ProjectRepository;
import com.freelancehub.freelancehub.project.service.ProjectService;
import com.freelancehub.freelancehub.review.repository.ReviewRepository;
import com.freelancehub.freelancehub.user.domain.User;
import com.freelancehub.freelancehub.user.repository.ClientRepository;
import com.freelancehub.freelancehub.user.repository.FreelancerRepository;
import com.freelancehub.freelancehub.user.repository.UserRepository;
import com.freelancehub.freelancehub.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminService {

    // ── These repos just for counts ── Business actions ────────────────────────────────
    private final UserRepository userRepository;
    private final FreelancerRepository freelancerRepository;
    private final ClientRepository clientRepository;
    private final ProjectRepository projectRepository;
    private final BidRepository bidRepository;
    private final ContractRepository contractRepository;
    private final ReviewRepository reviewRepository;

    // ── For Business actions should use services not direct access for others repos  ────────────────────────────────
    private final UserService userService;
    private final ProjectService projectService;

    // ── List all users (paginated) ────────────────────────────────

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(user -> new UserResponse(
                        user.getId(),
                        user.getEmail(),
                        user.getRole().name(),
                        user.isActive()
                ));
    }
    // ── Suspend user ──────────────────────────────────────────────

    @PreAuthorize("hasRole('ADMIN')")
    public void suspendUser(String userId) {
        userService.suspendUser(userId);
    }

    // ── Activate user ─────────────────────────────────────────────

    @PreAuthorize("hasRole('ADMIN')")
    public void activateUser(String userId) {
        userService.activateUser(userId);
    }


    // ── Delete any project ────────────────────────────────────────

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteProject(String projectId) {
        projectService.adminDeleteProject(projectId);
    }

    // ── Platform stats ────────────────────────────────────────────

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public PlatformStatsResponse getStats() {
        long totalUsers       = userRepository.count();
        long totalFreelancers = freelancerRepository.count();
        long totalClients     = clientRepository.count();
        long totalProjects    = projectRepository.count();
        long openProjects     = projectRepository.countByStatus(ProjectStatus.OPEN);
        long inProgress       = projectRepository.countByStatus(ProjectStatus.IN_PROGRESS);
        long completedProjects= projectRepository.countByStatus(ProjectStatus.COMPLETED);
        long totalBids        = bidRepository.count();
        long totalContracts   = contractRepository.count();
        long activeContracts  = contractRepository.countByStatus(ContractStatus.ACTIVE);
        long completedContracts = contractRepository.countByStatus(ContractStatus.COMPLETED);
        long totalReviews     = reviewRepository.count();
        Double avgRating      = reviewRepository.calculateOverallAverageRating();

        return new PlatformStatsResponse(
                totalUsers,
                totalFreelancers,
                totalClients,
                totalProjects,
                openProjects,
                inProgress,
                completedProjects,
                totalBids,
                totalContracts,
                activeContracts,
                completedContracts,
                totalReviews,
                avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0
        );
    }
}