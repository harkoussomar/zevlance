package com.freelancehub.freelancehub.project.domain;

public enum ProjectStatus {
    /** Accepting bids — visible to all freelancers. */
    OPEN,

    /** A bid has been accepted and a contract is active. */
    IN_PROGRESS,

    /** All milestones completed and contract closed. */
    COMPLETED,

    /** Cancelled by client or system. */
    CANCELLED,

    /**
     * Temporarily hidden by an admin pending policy review.
     * Different from CANCELLED — can be re-opened after review.
     */
    SUSPENDED
}