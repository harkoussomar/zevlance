CREATE TABLE bids (
    id             VARCHAR(36)      PRIMARY KEY,
    freelancer_id  VARCHAR(36)      NOT NULL REFERENCES users(id),
    project_id     VARCHAR(36)      NOT NULL REFERENCES projects(id),
    proposed_price DOUBLE PRECISION NOT NULL,
    cover_letter   TEXT             NOT NULL,
    estimated_days INT              NOT NULL,
    status         VARCHAR(20)      NOT NULL DEFAULT 'PENDING',
    submitted_at   TIMESTAMP        NOT NULL DEFAULT NOW(),
    UNIQUE (freelancer_id, project_id)
);