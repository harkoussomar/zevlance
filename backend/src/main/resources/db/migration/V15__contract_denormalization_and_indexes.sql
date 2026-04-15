ALTER TABLE contracts
ADD COLUMN freelancer_id VARCHAR(36),
ADD COLUMN client_id VARCHAR(36);

UPDATE contracts c
SET freelancer_id = b.freelancer_id,
    client_id     = p.client_id
FROM bids b
JOIN projects p ON p.id = b.project_id
WHERE c.bid_id = b.id;

ALTER TABLE contracts ALTER COLUMN freelancer_id SET NOT NULL;
ALTER TABLE contracts ALTER COLUMN client_id     SET NOT NULL;

ALTER TABLE contracts
ADD CONSTRAINT fk_contract_freelancer
    FOREIGN KEY (freelancer_id) REFERENCES users(id) ON DELETE RESTRICT;

ALTER TABLE contracts
ADD CONSTRAINT fk_contract_client
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE RESTRICT;

CREATE INDEX idx_contract_freelancer ON contracts(freelancer_id);
CREATE INDEX idx_contract_client     ON contracts(client_id);

CREATE INDEX idx_email_verification_email ON email_verification_tokens(email);
CREATE INDEX idx_password_reset_email     ON password_reset_tokens(email);