package com.freelancehub.freelancehub.notification.service;

public final class EmailTemplates {

    private EmailTemplates() {}

    // ── Base layout ────────────────────────────────────────────────────────

    private static String wrap(String title, String bodyHtml) {
        return """
            <!DOCTYPE html>
            <html><head><meta charset="UTF-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                     background: #f4f4f5; margin: 0; padding: 40px 0; }
              .card { background: #fff; max-width: 560px; margin: 0 auto;
                      border-radius: 12px; overflow: hidden;
                      box-shadow: 0 2px 8px rgba(0,0,0,.08); }
              .header { background: #18181b; padding: 28px 32px; }
              .header h1 { color: #fff; font-size: 20px; margin: 0; font-weight: 600; }
              .body { padding: 32px; color: #3f3f46; line-height: 1.6; }
              .body h2 { color: #18181b; font-size: 18px; margin: 0 0 12px; }
              .btn { display: inline-block; background: #18181b; color: #fff;
                     text-decoration: none; padding: 12px 28px; border-radius: 8px;
                     font-weight: 600; margin-top: 20px; font-size: 14px; }
              .footer { padding: 20px 32px; background: #fafafa;
                        border-top: 1px solid #e4e4e7; font-size: 12px; color: #a1a1aa; }
            </style></head><body>
            <div class="card">
              <div class="header"><h1>FreelanceHub</h1></div>
              <div class="body">%s</div>
              <div class="footer">© FreelanceHub — You received this because you have an account with us.</div>
            </div></body></html>
            """.formatted(bodyHtml);
    }

    // ── Auth emails ────────────────────────────────────────────────────────

    public static String welcome(String name) {
        return wrap("Welcome", """
            <h2>Welcome, %s! 🎉</h2>
            <p>Your FreelanceHub account is ready. You can now post projects, submit bids,
            and manage contracts — all in one place.</p>
            <p>Get started by completing your profile to build trust with your clients or freelancers.</p>
            """.formatted(name));
    }

    public static String passwordReset(String name, String resetUrl) {
        return wrap("Reset Password", """
            <h2>Password Reset Request</h2>
            <p>Hi %s,</p>
            <p>We received a request to reset your password. Click the button below —
            this link expires in <strong>1 hour</strong>.</p>
            <a href="%s" class="btn">Reset My Password</a>
            <p style="margin-top:20px;font-size:13px;color:#71717a;">
              If you didn't request this, you can safely ignore this email.
            </p>
            """.formatted(name, resetUrl));
    }

    // ── Bid emails ─────────────────────────────────────────────────────────

    public static String bidReceived(String clientName, String freelancerName,
                                     String projectTitle, String projectUrl) {
        return wrap("New Bid", """
            <h2>New bid on your project</h2>
            <p>Hi %s,</p>
            <p><strong>%s</strong> has submitted a bid on <strong>%s</strong>.</p>
            <p>Review their proposal and cover letter to decide whether to accept or reject.</p>
            <a href="%s" class="btn">View Bid</a>
            """.formatted(clientName, freelancerName, projectTitle, projectUrl));
    }

    public static String bidAccepted(String freelancerName, String projectTitle, String contractUrl) {
        return wrap("Bid Accepted", """
            <h2>Your bid was accepted! 🎉</h2>
            <p>Hi %s,</p>
            <p>Congratulations! The client accepted your bid on <strong>%s</strong>.
            A contract has been created automatically.</p>
            <a href="%s" class="btn">View Contract</a>
            """.formatted(freelancerName, projectTitle, contractUrl));
    }

    public static String bidRejected(String freelancerName, String projectTitle) {
        return wrap("Bid Update", """
            <h2>Bid not selected</h2>
            <p>Hi %s,</p>
            <p>The client has reviewed all bids on <strong>%s</strong> and decided to
            go with another freelancer this time.</p>
            <p>Keep applying — your next project is just around the corner.</p>
            """.formatted(freelancerName, projectTitle));
    }

    // ── Milestone emails ───────────────────────────────────────────────────

    public static String milestoneFunded(String name, String milestoneTitle,
                                         String projectTitle, String contractUrl) {
        return wrap("Milestone Funded", """
            <h2>Milestone funded ✅</h2>
            <p>Hi %s,</p>
            <p>The milestone <strong>%s</strong> on project <strong>%s</strong> has been
            funded and is now in escrow. You can start working on it.</p>
            <a href="%s" class="btn">View Contract</a>
            """.formatted(name, milestoneTitle, projectTitle, contractUrl));
    }

    public static String milestoneSubmitted(String clientName, String freelancerName,
                                            String milestoneTitle, String contractUrl) {
        return wrap("Deliverable Submitted", """
            <h2>Deliverable ready for review</h2>
            <p>Hi %s,</p>
            <p><strong>%s</strong> has submitted the deliverable for milestone
            <strong>%s</strong>. Please review and approve or request a revision.</p>
            <a href="%s" class="btn">Review Deliverable</a>
            """.formatted(clientName, freelancerName, milestoneTitle, contractUrl));
    }

    public static String milestoneApproved(String freelancerName, String milestoneTitle,
                                           String amount, String contractUrl) {
        return wrap("Payment Released", """
            <h2>Milestone approved — payment released 💰</h2>
            <p>Hi %s,</p>
            <p>The client approved your deliverable for <strong>%s</strong>.
            <strong>$%s</strong> has been transferred to your Stripe account.</p>
            <a href="%s" class="btn">View Contract</a>
            """.formatted(freelancerName, milestoneTitle, amount, contractUrl));
    }

    public static String paymentRefunded(String clientName, String milestoneTitle, String contractUrl) {
        return wrap("Refund Processed", """
            <h2>Refund processed</h2>
            <p>Hi %s,</p>
            <p>The payment for milestone <strong>%s</strong> has been refunded to your
            original payment method. It may take 5–10 business days to appear.</p>
            <a href="%s" class="btn">View Contract</a>
            """.formatted(clientName, milestoneTitle, contractUrl));
    }

    // ── Contract emails ────────────────────────────────────────────────────

    public static String contractCancelled(String name, String projectTitle, String contractUrl) {
        return wrap("Contract Cancelled", """
            <h2>Contract cancelled</h2>
            <p>Hi %s,</p>
            <p>The contract for project <strong>%s</strong> has been cancelled.
            Any funded milestones have been refunded automatically.</p>
            <a href="%s" class="btn">View Details</a>
            """.formatted(name, projectTitle, contractUrl));
    }

    public static String contractDisputed(String name, String projectTitle, String contractUrl) {
        return wrap("Contract Disputed", """
            <h2>Contract under dispute</h2>
            <p>Hi %s,</p>
            <p>The contract for project <strong>%s</strong> has been moved to a
            disputed state. Our team will review the case. Funds are frozen until resolved.</p>
            <a href="%s" class="btn">View Contract</a>
            """.formatted(name, projectTitle, contractUrl));
    }

    public static String emailVerification(String name, String verifyUrl) {
        return wrap("Verify your email", """
        <h2>Verify your email address</h2>
        <p>Hi %s,</p>
        <p>Thanks for signing up! Please verify your email address to activate your account.
        This link expires in <strong>24 hours</strong>.</p>
        <a href="%s" class="btn">Verify Email</a>
        <p style="margin-top:20px;font-size:13px;color:#71717a;">
          If you didn't create an account, you can safely ignore this email.
        </p>
        """.formatted(name, verifyUrl));
    }
}