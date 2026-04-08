package com.freelancehub.freelancehub.dashboard.service;

import com.freelancehub.freelancehub.bid.domain.BidStatus;
import com.freelancehub.freelancehub.bid.repository.BidRepository;
import com.freelancehub.freelancehub.contract.domain.Contract;
import com.freelancehub.freelancehub.contract.domain.ContractStatus;
import com.freelancehub.freelancehub.contract.domain.Milestone;
import com.freelancehub.freelancehub.contract.domain.MilestoneStatus;
import com.freelancehub.freelancehub.contract.repository.ContractRepository;
import com.freelancehub.freelancehub.contract.repository.MilestoneRepository;
import com.freelancehub.freelancehub.dashboard.dto.*;
import com.freelancehub.freelancehub.project.domain.ProjectStatus;
import com.freelancehub.freelancehub.project.repository.ProjectRepository;
import com.freelancehub.freelancehub.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final ContractRepository contractRepository;
    private final MilestoneRepository milestoneRepository;
    private final BidRepository bidRepository;
    private final ReviewRepository reviewRepository;
    private final ProjectRepository projectRepository;

    // ─── Freelancer Dashboard ─────────────────────────────────────────────────

    public FreelancerDashboardResponse getFreelancerDashboard(String freelancerId) {

        // ── Active contracts (max 5) ──────────────────────────────────────────
        List<Contract> activeContracts = contractRepository
                .findTopByFreelancerIdAndStatus(freelancerId, ContractStatus.ACTIVE, 5);

        // ── Milestone summaries — one bulk query, group in memory ─────────────
        List<String> contractIds = activeContracts.stream()
                .map(Contract::getId)
                .toList();

        Map<String, MilestoneSummaryDto> summaries = buildMilestoneSummaries(contractIds);

        // ── Stats ─────────────────────────────────────────────────────────────
        BigDecimal totalEarned = contractRepository.sumEarnedByFreelancerId(freelancerId);
        long activeCount   = contractRepository.countByFreelancerIdAndStatus(freelancerId, ContractStatus.ACTIVE);
        long pendingBids   = bidRepository.countByFreelancerIdAndStatus(freelancerId, BidStatus.PENDING);
        Double avgRating   = reviewRepository.calculateAverageRating(freelancerId);
        long reviewCount   = reviewRepository.countByRevieweeId(freelancerId);

        FreelancerDashboardStats stats = new FreelancerDashboardStats(
                totalEarned,
                activeCount,
                pendingBids,
                avgRating,   // null if no reviews — frontend renders "—"
                reviewCount
        );

        // ── Recent bids (max 5) ───────────────────────────────────────────────
        List<DashboardBidItem> recentBids = bidRepository
                .findTopByFreelancerId(freelancerId, 5)
                .stream()
                .map(b -> new DashboardBidItem(
                        b.getId(),
                        b.getProject().getTitle(),
                        b.getProposedPrice(),
                        b.getEstimatedDays(),
                        b.getStatus()
                ))
                .toList();

        // ── Latest reviews (max 2) ────────────────────────────────────────────
        List<DashboardReviewItem> latestReviews = reviewRepository
                .findTopByRevieweeId(freelancerId, 2)
                .stream()
                .map(r -> new DashboardReviewItem(
                        r.getId(),
                        r.getReviewer().getName(),
                        r.getRating(),
                        r.getComment(),
                        r.getCreatedAt()
                ))
                .toList();

        // ── Map contracts ─────────────────────────────────────────────────────
        List<DashboardContractItem> contractItems = activeContracts.stream()
                .map(c -> new DashboardContractItem(
                        c.getId(),
                        c.getBid().getProject().getTitle(),
                        c.getBid().getProject().getClient().getName(),
                        null, // clientName populated, freelancerName not needed in freelancer view
                        c.getAgreedPrice(),
                        c.getStatus(),
                        summaries.getOrDefault(c.getId(), emptyMilestoneSummary())
                ))
                .toList();

        return new FreelancerDashboardResponse(stats, contractItems, recentBids, latestReviews);
    }

    // ─── Client Dashboard ─────────────────────────────────────────────────────

    public ClientDashboardResponse getClientDashboard(String clientId) {

        // ── Active contracts (max 5) ──────────────────────────────────────────
        List<Contract> activeContracts = contractRepository
                .findTopByClientIdAndStatus(clientId, ContractStatus.ACTIVE, 5);

        List<String> contractIds = activeContracts.stream()
                .map(Contract::getId)
                .toList();

        Map<String, MilestoneSummaryDto> summaries = buildMilestoneSummaries(contractIds);

        // ── Stats ─────────────────────────────────────────────────────────────
        long openProjects    = projectRepository.countByClientIdAndStatus(clientId, ProjectStatus.OPEN);
        long activeCount     = contractRepository.countByClientIdAndStatus(clientId, ContractStatus.ACTIVE);
        long totalBids       = projectRepository.sumBidCountByClientId(clientId);
        BigDecimal totalSpent = contractRepository.sumSpentByClientId(clientId);

        ClientDashboardStats stats = new ClientDashboardStats(
                openProjects,
                activeCount,
                totalBids,
                totalSpent
        );

        // ── Recent projects (max 4) ───────────────────────────────────────────
        List<DashboardProjectItem> recentProjects = projectRepository
                .findTopByClientId(clientId, 4)
                .stream()
                .map(p -> new DashboardProjectItem(
                        p.getId(),
                        p.getTitle(),
                        p.getStatus(),
                        p.getBudgetMin(),
                        p.getBudgetMax(),
                        p.getDeadline(),
                        p.getBids().size(), // ← was p.getBidCount()
                        p.getRequiredSkills()
                ))
                .toList();

        // ── Map contracts ─────────────────────────────────────────────────────
        List<DashboardContractItem> contractItems = activeContracts.stream()
                .map(c -> new DashboardContractItem(
                        c.getId(),
                        c.getBid().getProject().getTitle(),
                        null, // clientName not needed in client view
                        c.getBid().getFreelancer().getName(),
                        c.getAgreedPrice(),
                        c.getStatus(),
                        summaries.getOrDefault(c.getId(), emptyMilestoneSummary())
                ))
                .toList();

        return new ClientDashboardResponse(stats, recentProjects, contractItems);
    }

    // ─── Shared milestone summary builder ─────────────────────────────────────
    //
    // Single bulk query → group in memory → no N+1 regardless of contract count.

    private Map<String, MilestoneSummaryDto> buildMilestoneSummaries(List<String> contractIds) {
        if (contractIds.isEmpty()) return Map.of();

        List<Milestone> allMilestones = milestoneRepository
                .findByContractIdIn(contractIds);

        // Group all milestones by contractId
        Map<String, List<Milestone>> byContract = allMilestones.stream()
                .collect(Collectors.groupingBy(m -> m.getContract().getId()));

        return contractIds.stream()
                .collect(Collectors.toMap(
                        id -> id,
                        id -> {
                            List<Milestone> milestones = byContract.getOrDefault(id, List.of());

                            int total    = milestones.size();
                            int approved = (int) milestones.stream()
                                    .filter(m -> m.getStatus() == MilestoneStatus.APPROVED)
                                    .count();

                            // First pending or submitted milestone ordered by dueDate
                            NextMilestoneDto next = milestones.stream()
                                    .filter(m -> m.getStatus() == MilestoneStatus.PENDING
                                            || m.getStatus() == MilestoneStatus.SUBMITTED)
                                    .min(Comparator.comparing(Milestone::getDueDate))
                                    .map(m -> new NextMilestoneDto(
                                            m.getTitle(),
                                            m.getDueDate(),
                                            m.getStatus()
                                    ))
                                    .orElse(null);

                            return new MilestoneSummaryDto(total, approved, next);
                        }
                ));
    }

    private MilestoneSummaryDto emptyMilestoneSummary() {
        return new MilestoneSummaryDto(0, 0, null);
    }
}