-- =============================================================================
-- V21__dispute_module_fixes.sql
-- Applies schema changes introduced by the dispute module security/logic fixes.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. disputes table
--    Add audit columns for resolution tracking.
--    resolvedBy / resolvedAt were missing, making RESOLVED a dead-end status
--    with no record of who closed a dispute or when.
-- -----------------------------------------------------------------------------
ALTER TABLE disputes
    ADD COLUMN resolved_by_id VARCHAR(36) NULL,
    ADD COLUMN resolved_at    TIMESTAMP   NULL;

COMMENT ON COLUMN disputes.resolved_by_id IS 'FK → users.id — admin who resolved this dispute';
COMMENT ON COLUMN disputes.resolved_at IS 'Timestamp when the dispute was marked RESOLVED';

ALTER TABLE disputes
    ADD CONSTRAINT fk_disputes_resolved_by
        FOREIGN KEY (resolved_by_id) REFERENCES users (id)
        ON DELETE SET NULL;

-- -----------------------------------------------------------------------------
-- 2. dispute_messages table
--    Drop NOT NULL on sender_id.
--    System messages (is_system_message = true) have no human sender.
--    Previously every automated message was incorrectly attributed to the
--    dispute initiator; now sender_id is simply NULL for system messages.
-- -----------------------------------------------------------------------------
ALTER TABLE dispute_messages
    ALTER COLUMN sender_id DROP NOT NULL;

COMMENT ON COLUMN dispute_messages.sender_id IS 'FK → users.id — NULL for system-generated messages';

-- -----------------------------------------------------------------------------
-- 3. Data fix (safety net)
--    Any existing system messages that were incorrectly recorded with a real
--    sender_id should have that cleared. This is non-destructive: it only
--    touches rows where is_system_message = true.
-- -----------------------------------------------------------------------------
UPDATE dispute_messages
SET    sender_id = NULL
WHERE  is_system_message = true
  AND  sender_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- NOTE: The Java field rename  isSystemMessage → systemMessage  in
-- DisputeMessage.java uses @Column(name = "is_system_message"), so the
-- physical column name is unchanged — no DDL needed for that change.
-- -----------------------------------------------------------------------------