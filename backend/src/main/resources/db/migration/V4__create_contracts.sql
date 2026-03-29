CREATE TABLE contracts (
    id           VARCHAR(36)      PRIMARY KEY,
    bid_id       VARCHAR(36)      NOT NULL UNIQUE REFERENCES bids(id),
    status       VARCHAR(20)      NOT NULL DEFAULT 'ACTIVE',
    agreed_price DOUBLE PRECISION NOT NULL,
    start_date   DATE             NOT NULL,
    end_date     DATE,
    created_at   TIMESTAMP        NOT NULL DEFAULT NOW()
);