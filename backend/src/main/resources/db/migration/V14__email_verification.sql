-- V14__email_verification.sql

-- ── Email verified flag on users ──────────────────────────────────────────────

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;

-- ── Email verification tokens ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS email_verification_tokens (
    token      VARCHAR(36)  NOT NULL,
    email      VARCHAR(150) NOT NULL,
    expires_at TIMESTAMP    NOT NULL,
    used       BOOLEAN      NOT NULL DEFAULT FALSE,

    CONSTRAINT pk_email_verification_tokens PRIMARY KEY (token)
);

CREATE INDEX IF NOT EXISTS idx_evt_email ON email_verification_tokens (email);

-- ── Password reset tokens index (missing from previous migration) ─────────────

CREATE INDEX IF NOT EXISTS idx_prt_email ON password_reset_tokens (email);