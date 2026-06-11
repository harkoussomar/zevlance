ALTER TABLE milestones
    ADD COLUMN stripe_transfer_id VARCHAR(255),
    ADD COLUMN stripe_refund_id VARCHAR(255),
    ADD COLUMN refund_status VARCHAR(30) NOT NULL DEFAULT 'NONE';

ALTER TABLE milestones
    ALTER COLUMN platform_fee_amount TYPE NUMERIC(38, 2),
    ALTER COLUMN freelancer_payout TYPE NUMERIC(38, 2);

CREATE UNIQUE INDEX uq_milestones_checkout_session
    ON milestones (stripe_checkout_session_id)
    WHERE stripe_checkout_session_id IS NOT NULL;

CREATE UNIQUE INDEX uq_milestones_payment_intent
    ON milestones (stripe_payment_intent_id)
    WHERE stripe_payment_intent_id IS NOT NULL;

CREATE UNIQUE INDEX uq_milestones_transfer
    ON milestones (stripe_transfer_id)
    WHERE stripe_transfer_id IS NOT NULL;

CREATE UNIQUE INDEX uq_milestones_refund
    ON milestones (stripe_refund_id)
    WHERE stripe_refund_id IS NOT NULL;

ALTER TABLE stripe_event_log
    ADD COLUMN last_error TEXT;
