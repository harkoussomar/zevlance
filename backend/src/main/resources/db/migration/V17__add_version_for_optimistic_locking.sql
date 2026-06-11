-- Add version column to contracts
ALTER TABLE contracts ADD COLUMN version BIGINT DEFAULT 0 NOT NULL;

-- Add version column to milestones (since we added it to the Milestone entity too)
ALTER TABLE milestones ADD COLUMN version BIGINT DEFAULT 0 NOT NULL;