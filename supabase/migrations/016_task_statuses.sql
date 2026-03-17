-- Migration 016: Task Statuses
-- Moves hardcoded sidebar status legend to a per-org configurable table.

CREATE TABLE IF NOT EXISTS public.task_statuses (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  value          text NOT NULL,          -- maps to TaskStatus enum (e.g. "completed")
  label          text NOT NULL,          -- display label (e.g. "Completed")
  color          text NOT NULL,          -- hex color (e.g. "#34d399")
  display_order  int  NOT NULL DEFAULT 0,
  created_at     timestamptz DEFAULT now(),
  UNIQUE (organization_id, value)
);

ALTER TABLE public.task_statuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_task_statuses" ON public.task_statuses
  FOR ALL
  USING (organization_id = public.user_org_id())
  WITH CHECK (organization_id = public.user_org_id());

-- Seed default statuses for the existing org
INSERT INTO public.task_statuses (organization_id, value, label, color, display_order) VALUES
  ('00000000-0000-0000-0000-000000000002', 'completed',      'Completed',   '#34d399', 0),
  ('00000000-0000-0000-0000-000000000002', 'in_progress',    'In Progress', '#60a5fa', 1),
  ('00000000-0000-0000-0000-000000000002', 'critical',       'Critical',    '#ef4444', 2),
  ('00000000-0000-0000-0000-000000000002', 'blocked',        'Blocked',     '#F7A800', 3),
  ('00000000-0000-0000-0000-000000000002', 'not_started',    'Not Started', '#64748b', 4),
  ('00000000-0000-0000-0000-000000000002', 'not_applicable', 'N/A',         '#94a3b8', 5)
ON CONFLICT (organization_id, value) DO NOTHING;
