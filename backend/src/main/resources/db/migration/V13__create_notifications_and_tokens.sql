-- Migration for PasswordResetToken Entity
CREATE TABLE password_reset_tokens (
    token VARCHAR(36) NOT NULL,
    email VARCHAR(150) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (token)
);

-- Migration for Notification Entity
CREATE TABLE notifications (
    id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    reference_id VARCHAR(36),
    reference_type VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- Indexes for Notification Entity
CREATE INDEX idx_notification_user ON notifications (user_id);
CREATE INDEX idx_notification_read ON notifications (user_id, read);