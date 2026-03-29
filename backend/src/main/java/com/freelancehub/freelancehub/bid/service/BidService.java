package com.freelancehub.freelancehub.bid.service;

import com.freelancehub.freelancehub.bid.domain.Bid;
import com.freelancehub.freelancehub.bid.domain.BidStatus;
import com.freelancehub.freelancehub.bid.dto.BidResponse;
import com.freelancehub.freelancehub.bid.dto.CreateBidRequest;
import com.freelancehub.freelancehub.bid.repository.BidRepository;
import com.freelancehub.freelancehub.contract.domain.Contract;
import com.freelancehub.freelancehub.contract.dto.ContractResponse;
import com.freelancehub.freelancehub.contract.service.ContractService;
import com.freelancehub.freelancehub.exception.ConflictException;
import com.freelancehub.freelancehub.exception.NotFoundException;
import com.freelancehub.freelancehub.exception.UnauthorizedException;
import com.freelancehub.freelancehub.project.domain.Project;
import com.freelancehub.freelancehub.project.domain.ProjectStatus;
import com.freelancehub.freelancehub.project.service.ProjectService;
import com.freelancehub.freelancehub.user.domain.Freelancer;
import com.freelancehub.freelancehub.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BidService {

    private final BidRepository bidRepository;

    private final ContractService contractService;
    private final ProjectService projectService;
    private final UserService userService;

    // ── Freelancer: submit bid ────────────────────────────────────

    @PreAuthorize("hasRole('FREELANCER')")
    @Transactional
    public BidResponse submitBid(String projectId, CreateBidRequest request, String freelancerId) {

        Project project = projectService.findProjectById(projectId);

        // Only OPEN projects accept bids
        if (project.getStatus() != ProjectStatus.OPEN) {
            throw new IllegalStateException("Project is not open for bidding");
        }

        // Duplicate bid check — enforced by DB unique constraint + this check
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

        return toResponse(bidRepository.save(bid));
    }

    // ── Client: view bids on own project ─────────────────────────

    @PreAuthorize("hasRole('CLIENT')")
    @Transactional(readOnly = true)
    public Page<BidResponse> getProjectBids(String projectId, String clientId, Pageable pageable) {
        Project project = projectService.findProjectById(projectId);

        if (!project.getClient().getId().equals(clientId)) {
            throw new UnauthorizedException("You do not own this project");
        }

        return bidRepository.findByProjectId(projectId, pageable).map(this::toResponse);
    }

    // ── Freelancer: view own bids ─────────────────────────────────

    @PreAuthorize("hasRole('FREELANCER')")
    @Transactional(readOnly = true)
    public Page<BidResponse> getMyBids(String freelancerId, Pageable pageable) {
        return bidRepository.findByFreelancerId(freelancerId, pageable).map(this::toResponse);
    }

    // ── Freelancer: withdraw bid ──────────────────────────────────

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
        return toResponse(bid);
    }

    // ── Client: reject bid ────────────────────────────────────────

    @PreAuthorize("hasRole('CLIENT')")
    @Transactional
    public BidResponse rejectBid(String bidId, String clientId) {
        Bid bid = findBidById(bidId);
        assertClientOwnsProject(bid, clientId);

        if (bid.getStatus() != BidStatus.PENDING) {
            throw new IllegalStateException("Only PENDING bids can be rejected");
        }

        bid.setStatus(BidStatus.REJECTED);
        return toResponse(bid);
    }

    // ── Client: accept bid — FULLY ATOMIC ─────────────────────────
    //
    //  One @Transactional boundary:
    //  1. Validate client owns the project
    //  2. Validate bid is PENDING
    //  3. Set bid → ACCEPTED
    //  4. Reject all other PENDING bids on the same project
    //  5. Set project → IN_PROGRESS
    //  6. Create Contract
    //  If any step throws → entire transaction rolls back

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

        // Step 1: accept this bid
        bid.setStatus(BidStatus.ACCEPTED);

        // Step 2: reject all other pending bids on this project
        bidRepository.rejectOtherBids(project.getId(), bidId, BidStatus.REJECTED);

        // Step 3: flip project to IN_PROGRESS
        project.setStatus(ProjectStatus.IN_PROGRESS);

        // Step 4: create contract automatically
        return contractService.createContract(bid);
    }

    // ── Helpers ───────────────────────────────────────────────────

    private Bid findBidById(String id) {
        return bidRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Bid not found: " + id));
    }

    private void assertClientOwnsProject(Bid bid, String clientId) {
        if (!bid.getProject().getClient().getId().equals(clientId)) {
            throw new UnauthorizedException("You do not own this project");
        }
    }

    // ── Mapping ───────────────────────────────────────────────────

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
                b.getSubmittedAt()
        );
    }

    private ContractResponse toContractResponse(Contract c) {
        Bid bid = c.getBid();
        Project project = bid.getProject();
        return new ContractResponse(
                c.getId(),
                bid.getId(),
                project.getId(),
                project.getTitle(),
                bid.getFreelancer().getId(),
                bid.getFreelancer().getName(),
                project.getClient().getId(),
                project.getClient().getName(),
                c.getStatus(),
                c.getAgreedPrice(),
                c.getStartDate(),
                c.getEndDate(),
                c.getCreatedAt()
        );
    }
}