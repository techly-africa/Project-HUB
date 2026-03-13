-- Migration 012: Add start_date and target_date to projects
alter table projects add column if not exists start_date date;
alter table projects add column if not exists target_date date;

-- Backfill the default project with existing hardcoded dates
update projects
set start_date = '2026-03-17', target_date = '2026-05-15'
where id = '00000000-0000-0000-0000-000000000001';
