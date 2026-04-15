package com.freelancehub.freelancehub.bid.service;

import com.freelancehub.freelancehub.bid.domain.Bid;
import com.freelancehub.freelancehub.bid.domain.BidStatus;
import com.freelancehub.freelancehub.bid.dto.BidResponse;
import com.freelancehub.freelancehub.bid.dto.BidSummaryResponse;
import com.freelancehub.freelancehub.bid.dto.CreateBidRequest;
import com.freelancehub.freelancehub.bid.repository.BidRepository;
import com.freelancehub.freelancehub.contract.domain.Contract;
import com.freelancehub.freelancehub.contract.dto.ContractResponse;
import com.freelancehub.freelancehub.contract.service.ContractService;
import com.freelancehub.freelancehub.exception.ConflictException;
import com.freelancehub.freelancehub.exception.NotFoundException;
import com.freelancehub.freelancehub.exception.UnauthorizedException;
import com.freelancehub.freelancehub.notification.domain.NotificationType;
import com.freelancehub.freelancehub.notification.domain.ReferenceType;
import com.freelancehub.freelancehub.notification.service.EmailTemplates;
import com.freelancehub.freelancehub.notification.service.NotificationService;
import com.freelancehub.freelancehub.project.domain.Project;
import com.freelancehub.freelancehub.project.domain.ProjectStatus;
import com.freelancehub.freelancehub.project.service.ProjectService;
import com.freelancehub.freelancehub.user.domain.Freelancer;
import com.freelancehub.freelancehub.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BidService {

    private final BidRepository bidRepository;
    private final ContractService contractService;
    private final ProjectService projectService;
    private final UserService userService;
    private final NotificationService notificationService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    // ── existing methods (unchanged) ─────────────────────────────────────────

    @PreAuthorize("hasRole('FREELANCER')")
    @Transactional
    public BidResponse submitBid(String projectId, CreateBidRequest request, String freelancerId) {
        Project project = projectService.findProjectById(projectId);

        if (project.getStatus() != ProjectStatus.OPEN) {
            throw new IllegalStateException("Project is not open for bidding");
        }

        if (bidRepository.existsByFreelancerIdAndProjectId(freelancerId, projectId)) {
            throw new ConflictException("You have already submitted a bid on this project");
        }

        Freelancer freelancer = userService.findFreelancerById(freelancerId);

        Bid bid = new Bid();
        bid.setFreelancer(freelancer);
        bid.setProject(project);
        bid.setProposedPrice(request.proposedPrice());
        bid.setCoverLetter(request.coverLetter());
        bid.setEstimatedDays(request.estimatedDays());

        bidRepository.save(bid);

        notificationService.notifyWithEmail(
                project.getClient().getId(),
                project.getClient().getEmail(),
                NotificationType.BID_RECEIVED,
                "New bid on \"" + project.getTitle() + "\"",
                freelancer.getName() + " submitted a bid of $" + request.proposedPrice(),
                bid.getId(),
                ReferenceType.BID,
                "New bid on your project",
                EmailTemplates.bidReceived(
                        project.getClient().getName(),
                        freelancer.getName(),
                        project.getTitle(),
                        frontendUrl + "/client/projects/" + project.getId()
                )
        );

        return toResponse(bid);
    }

    @PreAuthorize("hasRole('CLIENT')")
    @Transactional(readOnly = true)
    public Page<BidResponse> getProjectBids(String projectId, String clientId, Pageable pageable) {
        Project project = projectService.findProjectById(projectId);

        if (!project.getClient().getId().equals(clientId)) {
            throw new UnauthorizedException("You do not own this project");
        }

        return bidRepository.findByProjectId(projectId, pageable).map(this::toResponse);
    }

    @PreAuthorize("hasRole('FREELANCER')")
    @Transactional
    public BidResponse withdrawBid(String bidId, String freelancerId) {
        Bid bid = findBidById(bidId);

        if (!bid.getFreelancer().getId().equals(freelancerId)) {
            throw new UnauthorizedException("You do not own this bid");
        }

        if (bid.getStatus() != BidStatus.PENDING) {
            throw new IllegalStateException("Only PENDING bids can be withdrawn");
        }

        bid.setStatus(BidStatus.WITHDRAWN);

        notificationService.notify(
                bid.getProject().getClient().getId(),
                NotificationType.BID_WITHDRAWN,
                "A freelancer withdrew their bid",
                bid.getFreelancer().getName() + " withdrew their bid on \"" + bid.getProject().getTitle() + "\"",
                bid.getId(),
                ReferenceType.BID
        );

        return toResponse(bid);
    }

    @PreAuthorize("hasRole('CLIENT')")
    @Transactional
    public BidResponse rejectBid(String bidId, String clientId) {
        Bid bid = findBidById(bidId);
        assertClientOwnsProject(bid, clientId);

        if (bid.getStatus() != BidStatus.PENDING) {
            throw new IllegalStateException("Only PENDING bids can be rejected");
        }

        bid.setStatus(BidStatus.REJECTED);

        notificationService.notifyWithEmail(
                bid.getFreelancer().getId(),
                bid.getFreelancer().getEmail(),
                NotificationType.BID_REJECTED,
                "Your bid was not selected",
                "Your bid on \"" + bid.getProject().getTitle() + "\" was rejected.",
                bid.getId(),
                ReferenceType.BID,
                "Bid update",
                EmailTemplates.bidRejected(bid.getFreelancer().getName(), bid.getProject().getTitle())
        );

        return toResponse(bid);
    }

    @PreAuthorize("hasRole('CLIENT')")
    @Transactional
    public ContractResponse acceptBid(String bidId, String clientId) {
        Bid bid = findBidById(bidId);
        assertClientOwnsProject(bid, clientId);

        if (bid.getStatus() != BidStatus.PENDING) {
            throw new IllegalStateException("Only PENDING bids can be accepted");
        }

        Project project = bid.getProject();
        if (project.getStatus() != ProjectStatus.OPEN) {
            throw new IllegalStateException("Project is no longer open");
        }

        bid.setStatus(BidStatus.ACCEPTED);
        bidRepository.rejectOtherBids(project.getId(), bidId, BidStatus.REJECTED);
        project.setStatus(ProjectStatus.IN_PROGRESS);

        ContractResponse contractResponse = contractService.createContract(bid);

        notificationService.notifyWithEmail(
                bid.getFreelancer().getId(),
                bid.getFreelancer().getEmail(),
                NotificationType.BID_ACCEPTED,
                "Your bid was accepted! 🎉",
                "Your bid on \"" + bid.getProject().getTitle() + "\" was accepted. Contract is now active.",
                bid.getId(),
                ReferenceType.BID,
                "Your bid was accepted!",
                EmailTemplates.bidAccepted(
                        bid.getFreelancer().getName(),
                        bid.getProject().getTitle(),
                        frontendUrl + "/freelancer/contracts/" + contractResponse.id()
                )
        );

        return contractResponse;
    }

    // ── new / modified ────────────────────────────────────────────────────────

    /**
     * Returns a paginated list of the freelancer's bids.
     * When {@code status} is {@code null} all statuses are returned.
     */
    @PreAuthorize("hasRole('FREELANCER')")
    @Transactional(readOnly = true)
    public Page<BidResponse> getMyBids(String freelancerId, BidStatus status, Pageable pageable) {
        if (status == null) {
            return bidRepository.findByFreelancerId(freelancerId, pageable).map(this::toResponse);
        }
        return bidRepository.findByFreelancerIdAndStatus(freelancerId, status, pageable).map(this::toResponse);
    }

    /**
     * Returns aggregate counts and financial metrics for the freelancer's bids.
     * Completely independent from the paginated list — safe to call once on mount.
     */
    @PreAuthorize("hasRole('FREELANCER')")
    @Transactional(readOnly = true)
    public BidSummaryResponse getMyBidsSummary(String freelancerId) {
        long pending   = bidRepository.countByFreelancerIdAndStatus(freelancerId, BidStatus.PENDING);
        long accepted  = bidRepository.countByFreelancerIdAndStatus(freelancerId, BidStatus.ACCEPTED);
        long rejected  = bidRepository.countByFreelancerIdAndStatus(freelancerId, BidStatus.REJECTED);
        long withdrawn = bidRepository.countByFreelancerIdAndStatus(freelancerId, BidStatus.WITHDRAWN);
        long total     = pending + accepted + rejected + withdrawn;

        double totalValue   = bidRepository.sumAcceptedValueByFreelancerId(freelancerId);
        double successRate  = total > 0
                ? Math.round((accepted * 100.0 / total) * 10.0) / 10.0
                : 0.0;

        return new BidSummaryResponse(pending, accepted, rejected, withdrawn, totalValue, successRate);
    }

    // ── private helpers ───────────────────────────────────────────────────────

    private Bid findBidById(String id) {
        return bidRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Bid not found: " + id));
    }

    private void assertClientOwnsProject(Bid bid, String clientId) {
        if (!bid.getProject().getClient().getId().equals(clientId)) {
            throw new UnauthorizedException("You do not own this project");
        }
    }

    private BidResponse toResponse(Bid b) {
        return new BidResponse(
                b.getId(),
                b.getProject().getId(),
                b.getProject().getTitle(),
                b.getFreelancer().getId(),
                b.getFreelancer().getName(),
                b.getProposedPrice(),
                b.getCoverLetter(),
                b.getEstimatedDays(),
                b.getStatus(),
                b.getSubmittedAt(),
                b.getContract() != null ? b.getContract().getId() : null  // safe null check
        );
    }
}