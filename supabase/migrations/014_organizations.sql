-- Migration 014: Organizations
-- Introduces multi-tenant isolation: users can only see projects within their organization.

-- ─── Organizations table ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.organizations (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  domain     text UNIQUE,  -- email domain for auto-assignment, e.g. "rukisha.co.rw"
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- ─── Seed default organization ────────────────────────────────────────────────
INSERT INTO public.organizations (id, name, domain) VALUES
  ('00000000-0000-0000-0000-000000000002', 'Rukisha', 'rukisha.co.rw')
ON CONFLICT (id) DO NOTHING;

-- ─── Add organization_id to profiles ──────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);

-- Members can read their own organization
-- (must come AFTER profiles.organization_id exists — PostgreSQL validates policy expressions at creation time)
CREATE POLICY "org_members_read_org" ON public.organizations
  FOR SELECT USING (
    id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

-- Link ALL existing profiles to the Rukisha org.
-- Since all current data belongs to Rukisha, every profile gets assigned here.
-- This ensures no existing user loses access after the RLS change.
UPDATE public.profiles
  SET organization_id = '00000000-0000-0000-0000-000000000002'
  WHERE organization_id IS NULL;

-- ─── Add organization_id to projects ──────────────────────────────────────────
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Link existing projects to default org
UPDATE public.projects
  SET organization_id = '00000000-0000-0000-0000-000000000002'
  WHERE organization_id IS NULL;

-- Enforce non-null going forward
ALTER TABLE public.projects ALTER COLUMN organization_id SET NOT NULL;

-- ─── Helper: get current user's organization id ───────────────────────────────
CREATE OR REPLACE FUNCTION public.user_org_id()
RETURNS uuid AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ─── Projects RLS ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "rukisha_members_all" ON public.projects;

CREATE POLICY "org_select_projects" ON public.projects
  FOR SELECT USING (organization_id = public.user_org_id());

CREATE POLICY "org_insert_projects" ON public.projects
  FOR INSERT WITH CHECK (organization_id = public.user_org_id());

CREATE POLICY "org_update_projects" ON public.projects
  FOR UPDATE
  USING (organization_id = public.user_org_id())
  WITH CHECK (organization_id = public.user_org_id());

CREATE POLICY "org_delete_projects" ON public.projects
  FOR DELETE USING (organization_id = public.user_org_id());

-- ─── Plans RLS ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "rukisha read plans"   ON public.plans;
DROP POLICY IF EXISTS "rukisha insert plans" ON public.plans;
DROP POLICY IF EXISTS "rukisha delete plans" ON public.plans;

CREATE POLICY "org_plans" ON public.plans
  FOR ALL
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE organization_id = public.user_org_id()
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id FROM public.projects WHERE organization_id = public.user_org_id()
    )
  );

-- ─── Phases RLS ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "rukisha read phases"   ON public.phases;
DROP POLICY IF EXISTS "rukisha insert phases" ON public.phases;
DROP POLICY IF EXISTS "rukisha delete phases" ON public.phases;

CREATE POLICY "org_phases" ON public.phases
  FOR ALL
  USING (
    plan_id IN (
      SELECT pl.id FROM public.plans pl
      JOIN public.projects pr ON pl.project_id = pr.id
      WHERE pr.organization_id = public.user_org_id()
    )
  )
  WITH CHECK (
    plan_id IN (
      SELECT pl.id FROM public.plans pl
      JOIN public.projects pr ON pl.project_id = pr.id
      WHERE pr.organization_id = public.user_org_id()
    )
  );

-- ─── Tasks RLS ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "rukisha read tasks"   ON public.tasks;
DROP POLICY IF EXISTS "rukisha update tasks" ON public.tasks;
DROP POLICY IF EXISTS "rukisha insert tasks" ON public.tasks;
DROP POLICY IF EXISTS "rukisha delete tasks" ON public.tasks;

CREATE POLICY "org_tasks" ON public.tasks
  FOR ALL
  USING (
    phase_id IN (
      SELECT ph.id FROM public.phases ph
      JOIN public.plans pl ON ph.plan_id = pl.id
      JOIN public.projects pr ON pl.project_id = pr.id
      WHERE pr.organization_id = public.user_org_id()
    )
  )
  WITH CHECK (
    phase_id IN (
      SELECT ph.id FROM public.phases ph
      JOIN public.plans pl ON ph.plan_id = pl.id
      JOIN public.projects pr ON pl.project_id = pr.id
      WHERE pr.organization_id = public.user_org_id()
    )
  );

-- ─── Profiles RLS: scope to same org ─────────────────────────────────────────
-- (replaces open "public read" so users only see teammates as assignee candidates)
DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;

CREATE POLICY "org_read_profiles" ON public.profiles
  FOR SELECT USING (
    organization_id = public.user_org_id()
    OR id = auth.uid()  -- always allow reading own profile
  );

-- ─── Task comments RLS ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public read comments"    ON public.task_comments;
DROP POLICY IF EXISTS "Authed users can comment" ON public.task_comments;
DROP POLICY IF EXISTS "rukisha insert comments" ON public.task_comments;
DROP POLICY IF EXISTS "rukisha read comments"   ON public.task_comments;
DROP POLICY IF EXISTS "rukisha delete comments" ON public.task_comments;

CREATE POLICY "org_task_comments" ON public.task_comments
  FOR ALL
  USING (
    task_id IN (
      SELECT t.id FROM public.tasks t
      JOIN public.phases ph ON t.phase_id = ph.id
      JOIN public.plans pl ON ph.plan_id = pl.id
      JOIN public.projects pr ON pl.project_id = pr.id
      WHERE pr.organization_id = public.user_org_id()
    )
  )
  WITH CHECK (
    task_id IN (
      SELECT t.id FROM public.tasks t
      JOIN public.phases ph ON t.phase_id = ph.id
      JOIN public.plans pl ON ph.plan_id = pl.id
      JOIN public.projects pr ON pl.project_id = pr.id
      WHERE pr.organization_id = public.user_org_id()
    )
  );

-- ─── Task attachments RLS ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "authenticated_users_all" ON public.task_attachments;

CREATE POLICY "org_task_attachments" ON public.task_attachments
  FOR ALL
  USING (
    task_id IN (
      SELECT t.id FROM public.tasks t
      JOIN public.phases ph ON t.phase_id = ph.id
      JOIN public.plans pl ON ph.plan_id = pl.id
      JOIN public.projects pr ON pl.project_id = pr.id
      WHERE pr.organization_id = public.user_org_id()
    )
  )
  WITH CHECK (
    task_id IN (
      SELECT t.id FROM public.tasks t
      JOIN public.phases ph ON t.phase_id = ph.id
      JOIN public.plans pl ON ph.plan_id = pl.id
      JOIN public.projects pr ON pl.project_id = pr.id
      WHERE pr.organization_id = public.user_org_id()
    )
  );

-- ─── Update handle_new_user: auto-assign org by email domain ─────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_domain text;
  org_id      uuid;
BEGIN
  user_domain := split_part(NEW.email, '@', 2);

  SELECT id INTO org_id
    FROM public.organizations
    WHERE domain = user_domain;

  INSERT INTO public.profiles (id, email, organization_id)
    VALUES (NEW.id, NEW.email, org_id)
    ON CONFLICT (id) DO UPDATE
      SET email           = EXCLUDED.email,
          organization_id = COALESCE(public.profiles.organization_id, EXCLUDED.organization_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
