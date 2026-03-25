CREATE TABLE projects (
    id           VARCHAR(36)      PRIMARY KEY,
    title        VARCHAR(200)     NOT NULL,
    description  TEXT             NOT NULL,
    budget_min   DOUBLE PRECISION NOT NULL,
    budget_max   DOUBLE PRECISION NOT NULL,
    status       VARCHAR(20)      NOT NULL DEFAULT 'OPEN',
    category     VARCHAR(50)      NOT NULL,
    deadline     DATE             NOT NULL,
    client_id    VARCHAR(36)      NOT NULL REFERENCES users(id),
    created_at   TIMESTAMP        NOT NULL DEFAULT NOW()
);

CREATE TABLE project_skills (
    project_id VARCHAR(36)  NOT NULL REFERENCES projects(id),
    skill      VARCHAR(100) NOT NULL
);