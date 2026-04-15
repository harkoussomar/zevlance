# FreelanceHub Test Scenarios & Edge Cases

This document outlines comprehensive test scenarios for the entire FreelanceHub application, covering both happy paths and edge cases based on the system's architecture and backend/frontend logic.

---

## 1. Authentication & Registration

### 1.1 Registration (Client & Freelancer)
- **Scenario:** Register a new Freelancer with valid data.
  - **Expected:** Account created, verification email sent, redirected to `/verify-email`.
- **Scenario:** Register a new Client with valid data (including optional company details).
  - **Expected:** Account created, verification email sent, redirected to `/verify-email`.
- **Scenario [Edge]:** Attempt to register with an already existing email.
  - **Expected:** 409 Conflict error, UI shows "An account with this email already exists".
- **Scenario [Edge]:** Password confirmation mismatch.
  - **Expected:** UI validation prevents submission.
- **Scenario [Edge]:** Weak password (e.g., missing uppercase or number).
  - **Expected:** Zod schema rejects it before hitting the backend.

### 1.2 Login & Session Management
- **Scenario:** Login with valid credentials (verified email).
  - **Expected:** JWT, `has_session`, `user_role`, and `email_verified` cookies set. Redirected to respective dashboard (`/client` or `/freelancer`).
- **Scenario [Edge]:** Login with invalid password or email.
  - **Expected:** 401 error, UI displays "Invalid email or password".
- **Scenario:** Logout.
  - **Expected:** All cookies cleared, state reset, redirected to `/login`.
- **Scenario [Edge]:** User closes tab and returns.
  - **Expected:** `AuthProvider` restores session from cookies without requiring re-login.

### 1.3 Email Verification & Middleware Routing
- **Scenario:** Click valid email verification link.
  - **Expected:** Verification successful, `email_verified` cookie updated, redirected to dashboard.
- **Scenario [Edge]:** Click expired or used token.
  - **Expected:** Error shown, prompted to request a new link.
- **Scenario [Edge]:** Access protected route (`/client`, `/freelancer`, `/settings`) while logged in but NOT verified.
  - **Expected:** Middleware forcefully redirects to `/verify-email`.
- **Scenario [Edge]:** Client attempts to access `/freelancer` paths (RBAC).
  - **Expected:** Middleware redirects to `/client`.

### 1.4 Password Reset
- **Scenario:** Request password reset for valid email.
  - **Expected:** Email sent with token.
- **Scenario:** Complete password reset with valid token.
  - **Expected:** Password changed, user can login.
- **Scenario [Edge]:** Attempt reset with expired or used token.
  - **Expected:** Handled gracefully with error message.

---

## 2. Profile & Settings

### 2.1 Profile Views
- **Scenario:** View own profile (`/client/profile` or `/freelancer/profile`).
  - **Expected:** Shows full details.
- **Scenario:** Public views of freelancer profile (`/freelancers/[id]`).
  - **Expected:** Shows public info, skills, rating, completed contracts count, and reviews.

### 2.2 Profile Updates
- **Scenario:** Freelancer updates bio, hourly rate, and skills.
  - **Expected:** Cache updated instantly, public profile reflects changes.
- **Scenario:** Client updates company name and description.
  - **Expected:** Cache and UI updated instantly.

### 2.3 Stripe Connect Onboarding (Freelancer)
- **Scenario:** Freelancer initiates Stripe onboarding.
  - **Expected:** Directed to Stripe, returns and status is polled/updated to onboarded.
- **Scenario [Edge]:** Freelancer drops off during Stripe flow.
  - **Expected:** Status remains not onboarded. Prompt stays active.

---

## 3. Project Management (Client)

### 3.1 Flow
- **Scenario:** Client creates a new project.
  - **Expected:** Project created with `OPEN` status. Appears in "My Projects" and public marketplace.
- **Scenario:** Client updates an OPEN project's details.
  - **Expected:** Success, optimistic UI updates.
- **Scenario:** Client cancels an OPEN project.
  - **Expected:** Status changes to `CANCELLED`. Disappears from public marketplace but stays in client's history.

### 3.2 Edge Cases
- **Scenario [Edge]:** Client creates a project where Min Budget > Max Budget.
  - **Expected:** Backend rejects with `IllegalArgumentException`. form validation should also catch this.
- **Scenario [Edge]:** Try to update a project that is `IN_PROGRESS` or `COMPLETED`.
  - **Expected:** Backend rejects ("Only OPEN projects can be edited").
- **Scenario [Edge]:** Try to cancel an already `COMPLETED` or `CANCELLED` project.
  - **Expected:** Backend rejects ("Cannot cancel a completed project").
- **Scenario [Edge]:** Non-owner tries to edit or cancel a project.
  - **Expected:** 403 Unauthorized ("You do not own this project").

---

## 4. Project Marketplace (Public/Freelancer)

- **Scenario:** User browses projects with pagination.
  - **Expected:** Loads lists of `OPEN` projects.
- **Scenario:** Apply filters (Category, min/max budget, skill).
  - **Expected:** List reflects accurate filtered data.
- **Scenario [Edge]:** Enter negative numbers for budget filters.
  - **Expected:** Sanitized or ignored by backend/frontend.

---

## 5. Bidding System

### 5.1 Submitting and Withdrawing (Freelancer)
- **Scenario:** Freelancer submits a valid bid on an OPEN project.
  - **Expected:** Bid created (`PENDING`). Client receives `BID_RECEIVED` notification.
- **Scenario [Edge]:** Freelancer bids on a project that is `IN_PROGRESS` or `CANCELLED`.
  - **Expected:** Backend rejects ("Project is not open for bidding").
- **Scenario [Edge]:** Freelancer submits multiple bids on the same project.
  - **Expected:** 409 Conflict ("You have already submitted a bid").
- **Scenario:** Freelancer withdraws their own `PENDING` bid.
  - **Expected:** Status changes to `WITHDRAWN`. Client notified.
- **Scenario [Edge]:** Freelancer tries to withdraw an `ACCEPTED` or `REJECTED` bid.
  - **Expected:** Backend rejects ("Only PENDING bids can be withdrawn").

### 5.2 Reviewing Bids (Client)
- **Scenario:** Client rejects a specific bid.
  - **Expected:** Bid status `REJECTED`. Freelancer notified via email.
- **Scenario:** Client accepts a bid.
  - **Expected:** 
    - Bid status `ACCEPTED`.
    - Remaining pending bids on that project change to `REJECTED`.
    - Project status changes to `IN_PROGRESS`.
    - **Contract is automatically created** (`ACTIVE`).
    - Freelancer notified via email.

---

## 6. Contract & Milestone Lifecycle

### 6.1 Creating Milestones (Client)
- **Scenario:** Client adds a milestone to an `ACTIVE` contract.
  - **Expected:** Milestone created with `PENDING` status.
- **Scenario [Edge]:** Client attempts to add milestones that total more than the Agreed Contract Price.
  - **Expected:** Backend rejects ("only $X remaining in the contract budget").
- **Scenario [Edge]:** Client tries to add a milestone to a `COMPLETED` or `CANCELLED` contract.
  - **Expected:** Backend rejects ("Milestones can only be added to ACTIVE contracts").

### 6.2 Funding Milestone (Client -> Stripe)
- **Scenario:** Client clicks fund on a `PENDING` milestone.
  - **Expected:** Redirects to Stripe Checkout.
- **Scenario [Edge]:** Freelancer hasn't onboarded to Stripe Connect.
  - **Expected:** Backend prevents funding ("ask them to complete onboarding").
- **Scenario**: Successful payment webhook (`checkout.session.completed`).
  - **Expected:** Webhook caught. Milestone status -> `FUNDED`. Freelancer notified.
- **Scenario [Edge]:** Webhook Idempotency. Send the exact same webhook payload twice.
  - **Expected:** Second webhook is ignored (caught by `stripe_event_log`).

### 6.3 Deliverable Submission (Freelancer)
- **Scenario:** Freelancer submits work for a `FUNDED` milestone.
  - **Expected:** Milestone status -> `SUBMITTED`. Client notified.
- **Scenario [Edge]:** Freelancer tries to submit work for a `PENDING` or `APPROVED` milestone.
  - **Expected:** Backend rejects ("Deliverable can only be submitted when... FUNDED or REVISION_REQUESTED").

### 6.4 Approval & Revisions (Client)
- **Scenario:** Client requests a revision.
  - **Expected:** Milestone status -> `REVISION_REQUESTED`. Revision count increments. Freelancer notified.
- **Scenario [Edge]:** Client requests revision for the **4th time** (Max represents 3).
  - **Expected:** Status auto-escalates to `DISPUTED`. Funds frozen. Admin intervention required.
- **Scenario:** Client approves the milestone.
  - **Expected:**
    - Milestone status -> `APPROVED`.
    - Payment is released via Stripe Transfer to Freelancer's connected account.
    - Freelancer notified.
- **Scenario [Edge - Auto-Complete]:** Client approves the *final* milestone, bringing the total approved amount to >= Contract Agreed Price.
  - **Expected:** Entire contract automatically transitions to `COMPLETED`.

### 6.5 Contract Cancellation & Disputes
- **Scenario:** Client or Freelancer cancels an `ACTIVE` contract.
  - **Expected:** Contract -> `CANCELLED`. Any `FUNDED`, `SUBMITTED`, or `REVISION_REQUESTED` milestones are automatically **refunded** to the client via Stripe API.
- **Scenario:** Either party disputes the contract.
  - **Expected:** Contract -> `DISPUTED`. Admins notified.

---

## 7. Review System

- **Scenario:** Client leaves a 5-star review on a `COMPLETED` contract.
  - **Expected:** Freelancer's overall rating is recalculated and updated.
- **Scenario:** Freelancer leaves a review on the same contract.
  - **Expected:** Client's overall rating is recalculated.
- **Scenario [Edge]:** Try to leave a review on an `ACTIVE` or `CANCELLED` contract.
  - **Expected:** Backend rejects ("Reviews can only be left on COMPLETED contracts").
- **Scenario [Edge]:** User tries to leave a second review on the same contract.
  - **Expected:** 409 Conflict exception.

---

## 8. Notifications

- **Scenario:** Bell icon shows correct unread count.
  - **Expected:** Polling `/notifications/unread-count` returns accurate count.
- **Scenario:** Click dropdown, mark single notification as read.
  - **Expected:** Unread count decrements.
- **Scenario:** Click "Mark all as read".
  - **Expected:** Unread count drops to 0. All notifications visually update.

---

## 9. Admin Functions

- **Scenario:** Admin views platform stats.
  - **Expected:** Aggregated data returns correctly.
- **Scenario:** Admin deletes project.
  - **Expected:** Complete cascade delete or soft delete functions properly. (Note: Ensure orphan records like bids and contracts handle project deletion gracefully).
