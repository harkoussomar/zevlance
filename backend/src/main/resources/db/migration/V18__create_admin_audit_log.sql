CREATE TYPE admin_action AS ENUM (
    'SUSPEND_USER',
    'ACTIVATE_USER',
    'DELETE_PROJECT'
);

CREATE TABLE admin_audit_logs (
    id UUID PRIMARY KEY,
    admin_id VARCHAR(255) NOT NULL,
    action admin_action NOT NULL,
    target_entity_type VARCHAR(255) NOT NULL,
    target_entity_id VARCHAR(255) NOT NULL,
    reason TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_audit_logs_admin_id ON admin_audit_logs(admin_id);
CREATE INDEX idx_admin_audit_logs_created_at ON admin_audit_logs(created_at);

ALTER TABLE projects ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
