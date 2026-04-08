-- V12__revert_hourly_rate_to_double.sql
ALTER TABLE freelancers
    ALTER COLUMN hourly_rate TYPE DOUBLE PRECISION USING hourly_rate::DOUBLE PRECISION;