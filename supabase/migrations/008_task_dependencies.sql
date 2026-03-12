-- Migration 008: Task Dependencies and Blocking
-- Adds support for tasks being blocked by other tasks.

-- 1. Add blocked_by column with correct syntax
alter table tasks add column if not exists blocked_by jsonb default '[]'::jsonb;

-- 2. Initialize existing tasks (if they were null for some reason)
update tasks set blocked_by = '[]'::jsonb where blocked_by is null;

-- 3. Ensure status check is broad enough
alter table tasks drop constraint if exists tasks_status_check;
alter table tasks add constraint tasks_status_check 
  check (status in ('not_started','in_progress','completed','blocked','not_applicable','critical'));
