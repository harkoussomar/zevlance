// --- DisputeStatus.java ---
package com.freelancehub.freelancehub.dispute.domain;

public enum DisputeStatus {
    OPEN,           // Parties are chatting/mediating
    ESCALATED,      // Admin intervention requested
    RESOLVED        // Admin or mutual agreement closed it
}