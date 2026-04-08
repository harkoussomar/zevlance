-- ─── V5: Payment / Escrow fields ─────────────────────────────────────────────
--
-- MilestoneStatus gains: FUNDED, DISPUTED, REFUNDED
-- Milestone gains:       Stripe session/intent IDs, fee breakdown, timestamps
-- Freelancers gains:     Stripe Connect account fields
-- New table:             stripe_event_log  (webhook idempotency)

-- ── Milestone payment columns ─────────────────────────────────────────────────

ALTER TABLE milestones
    ADD COLUMN stripe_checkout_session_id VARCHAR(255),
    ADD COLUMN stripe_payment_intent_id   VARCHAR(255),
    ADD COLUMN platform_fee_amount        NUMERIC(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN freelancer_payout          NUMERIC(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN funded_at                  TIMESTAMP,
    ADD COLUMN released_at                TIMESTAMP,
    ADD COLUMN revision_count             INT NOT NULL DEFAULT 0;

-- Index: look up milestone by Stripe session quickly in webhook handler
CREATE INDEX idx_milestones_checkout_session
    ON milestones (stripe_checkout_session_id)
    WHERE stripe_checkout_session_id IS NOT NULL;

-- ── Freelancer Stripe Connect columns ─────────────────────────────────────────

ALTER TABLE freelancers
    ADD COLUMN stripe_account_id VARCHAR(255),
    ADD COLUMN stripe_onboarded  BOOLEAN NOT NULL DEFAULT FALSE;

-- ── Webhook idempotency log ───────────────────────────────────────────────────

CREATE TABLE stripe_event_log (
    id         VARCHAR(36)  PRIMARY KEY,   -- Stripe event ID (evt_...)
    type       VARCHAR(100) NOT NULL,
    processed  BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);