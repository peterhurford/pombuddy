-- Migration for existing databases: add pause columns and switch to text IDs
-- If running on a fresh DB with updated 001, this is a no-op for the pause columns.

-- Add pause columns to rooms (idempotent with IF NOT EXISTS approach)
alter table rooms add column if not exists paused boolean not null default false;
alter table rooms add column if not exists paused_remaining int;

-- To switch from uuid to text IDs:
-- Since this is pre-launch with no real data, drop and recreate both tables.
-- If you already ran the updated 001_initial.sql with text IDs, skip this migration.

-- Uncomment the following if you need to migrate an existing uuid-based DB:
-- drop table if exists cycles;
-- drop table if exists rooms;
-- Then re-run 001_initial.sql
