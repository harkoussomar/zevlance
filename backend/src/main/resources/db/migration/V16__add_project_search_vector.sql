ALTER TABLE projects ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (
        to_tsvector('english',
            coalesce(title, '') || ' ' || coalesce(description, '')
        )
    ) STORED;

CREATE INDEX idx_projects_search_vector ON projects USING GIN(search_vector);