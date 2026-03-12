-- Migration 006: Task Description
-- Adds a freeform description column to tasks for detailed context

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS description TEXT;
