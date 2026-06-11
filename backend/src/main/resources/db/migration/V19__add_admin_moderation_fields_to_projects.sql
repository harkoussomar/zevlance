ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS admin_note   TEXT,
    ADD COLUMN IF NOT EXISTS flagged      BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS featured     BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS updated_at   TIMESTAMP;

-- Back-fill updated_at for all existing rows so it's never null
UPDATE projects SET updated_at = created_at WHERE updated_at IS NULL;