-- V11__fix_monetary_column_types.sql
ALTER TABLE bids
    ALTER COLUMN proposed_price TYPE NUMERIC(38,2) USING proposed_price::NUMERIC;

ALTER TABLE contracts
    ALTER COLUMN agreed_price TYPE NUMERIC(38,2) USING agreed_price::NUMERIC;

ALTER TABLE freelancers
    ALTER COLUMN hourly_rate TYPE NUMERIC(38,2) USING hourly_rate::NUMERIC;

ALTER TABLE milestones
    ALTER COLUMN amount TYPE NUMERIC(38,2) USING amount::NUMERIC;

ALTER TABLE projects
    ALTER COLUMN budget_min TYPE NUMERIC(38,2) USING budget_min::NUMERIC;

ALTER TABLE projects
    ALTER COLUMN budget_max TYPE NUMERIC(38,2) USING budget_max::NUMERIC;