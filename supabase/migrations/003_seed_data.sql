-- Rukisha Project Tracker — Seed Data
-- Run this in your Supabase SQL editor AFTER initial_schema.sql

-- ── Insert Plans ───────────────────────────────────────────────────────────
INSERT INTO plans (id, name, type) VALUES
('tech-v1', 'Technology Core Implementation', 'tech'),
('ops-v1', 'Operational Readiness Plan', 'operational')
ON CONFLICT (id) DO NOTHING;

-- ── Insert Phases ──────────────────────────────────────────────────────────
INSERT INTO phases (id, plan_id, wbs, name, display_order) VALUES
('p1', 'tech-v1', '1', 'Infrastructure Setup', 10),
('p2', 'tech-v1', '2', 'Core Engineering', 20),
('p3', 'ops-v1', '1', 'Operations Setup', 10)
ON CONFLICT (id) DO NOTHING;

-- ── Insert Tasks ───────────────────────────────────────────────────────────
INSERT INTO tasks (id, phase_id, wbs, name, owner, start_day, end_day, status, remarks) VALUES
('t1', 'p1', '1.1', 'Cloud Environment Setup', 'DevOps', 1, 3, 'completed', 'AWS environments established with staging/prod isolation.'),
('t2', 'p1', '1.2', 'Database Migration Client', 'Backend', 2, 5, 'in_progress', 'Supabase handles migrations. Verification pending.'),
('t3', 'p2', '2.1', 'API Integration', 'Fullstack', 6, 15, 'not_started', null),
('t4', 'p3', '1.1', 'Staff Onboarding', 'HR', 1, 10, 'in_progress', 'Reviewing first batch of candidates.')
ON CONFLICT (id) DO NOTHING;
