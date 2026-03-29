CREATE TABLE users (
    id            VARCHAR(36)  PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password      VARCHAR(255) NOT NULL,
    phone         VARCHAR(20),
    role          VARCHAR(20)  NOT NULL CHECK (role IN ('FREELANCER','CLIENT','ADMIN')),
    active        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE freelancers (
    id              VARCHAR(36)        PRIMARY KEY REFERENCES users(id),
    bio             TEXT,
    hourly_rate     DOUBLE PRECISION,
    profile_picture VARCHAR(255),
    rating          DOUBLE PRECISION   NOT NULL DEFAULT 0.0
);

CREATE TABLE clients (
    id                   VARCHAR(36)  PRIMARY KEY REFERENCES users(id),
    company_name         VARCHAR(150),
    company_description  TEXT,
    website              VARCHAR(255),
    rating               DOUBLE PRECISION NOT NULL DEFAULT 0.0
);

CREATE TABLE freelancer_skills (
    freelancer_id VARCHAR(36)  NOT NULL REFERENCES freelancers(id),
    skill         VARCHAR(100) NOT NULL
);