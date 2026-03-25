CREATE TABLE reviews (
    id          VARCHAR(36) PRIMARY KEY,
    contract_id VARCHAR(36) NOT NULL REFERENCES contracts(id),
    reviewer_id VARCHAR(36) NOT NULL REFERENCES users(id),
    reviewee_id VARCHAR(36) NOT NULL REFERENCES users(id),
    rating      INT         NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT,
    created_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
    UNIQUE (contract_id, reviewer_id)
);