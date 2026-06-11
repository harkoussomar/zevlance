-- V20__create_dispute_tables.sql

-- 1. Create the disputes table
CREATE TABLE disputes (
    id VARCHAR(36) PRIMARY KEY,
    contract_id VARCHAR(36) NOT NULL,
    initiator_id VARCHAR(36) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE,

    -- Ensure only one active dispute per contract
    CONSTRAINT uq_disputes_contract UNIQUE (contract_id),

    -- Foreign keys
    CONSTRAINT fk_disputes_contract FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
    CONSTRAINT fk_disputes_initiator FOREIGN KEY (initiator_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. Create the dispute_messages table for the chat room
CREATE TABLE dispute_messages (
    id VARCHAR(36) PRIMARY KEY,
    dispute_id VARCHAR(36) NOT NULL,
    sender_id VARCHAR(36) NOT NULL,
    message TEXT NOT NULL,
    is_system_message BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),

    -- Foreign keys
    CONSTRAINT fk_dispute_messages_dispute FOREIGN KEY (dispute_id) REFERENCES disputes(id) ON DELETE CASCADE,
    CONSTRAINT fk_dispute_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Create the dispute_evidence table for Cloudinary uploads
CREATE TABLE dispute_evidence (
    id VARCHAR(36) PRIMARY KEY,
    dispute_id VARCHAR(36) NOT NULL,
    uploader_id VARCHAR(36) NOT NULL,
    file_url VARCHAR(512) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    public_id VARCHAR(512) NOT NULL,
    description VARCHAR(1000),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),

    -- Foreign keys
    CONSTRAINT fk_dispute_evidence_dispute FOREIGN KEY (dispute_id) REFERENCES disputes(id) ON DELETE CASCADE,
    CONSTRAINT fk_dispute_evidence_uploader FOREIGN KEY (uploader_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Indexes for fast retrieval in the chat room and admin dashboard
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_dispute_messages_dispute_id ON dispute_messages(dispute_id);
CREATE INDEX idx_dispute_messages_created_at ON dispute_messages(created_at);
CREATE INDEX idx_dispute_evidence_dispute_id ON dispute_evidence(dispute_id);