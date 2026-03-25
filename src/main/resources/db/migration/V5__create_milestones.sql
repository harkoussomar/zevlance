CREATE TABLE milestones (
    id              VARCHAR(36)      PRIMARY KEY,
    contract_id     VARCHAR(36)      NOT NULL REFERENCES contracts(id),
    title           VARCHAR(200)     NOT NULL,
    description     TEXT,
    amount          DOUBLE PRECISION NOT NULL,
    status          VARCHAR(30)      NOT NULL DEFAULT 'PENDING',
    due_date        DATE             NOT NULL,
    deliverable_url VARCHAR(500)
);