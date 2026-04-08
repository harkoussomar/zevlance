package com.freelancehub.freelancehub.contract.domain;

public enum MilestoneStatus {

    /** Created by client, awaiting escrow funding. */
    PENDING,

    /** Client has paid into escrow. Freelancer may now work and submit. */
    FUNDED,

    /** Freelancer submitted a deliverable URL. Awaiting client review. */
    SUBMITTED,

    /** Client approved the deliverable. Funds released to freelancer. */
    APPROVED,

    /** Client requested changes. Freelancer must resubmit. */
    REVISION_REQUESTED,

    /** Under dispute resolution. Funds frozen in escrow. */
    DISPUTED,

    /** Payment refunded to client (cancellation or resolved dispute). */
    REFUNDED
}