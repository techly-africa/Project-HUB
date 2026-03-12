-- Migration 005: Gantt Chart Dates
-- Add proper start/end timestamps for professional Gantt visualization
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;

-- Backfill from start_day/end_day if they exist (assuming project start is today)
UPDATE tasks 
SET start_date = NOW() + (start_day || ' days')::interval,
    end_date = NOW() + (end_day || ' days')::interval
WHERE start_day IS NOT NULL AND end_day IS NOT NULL;
